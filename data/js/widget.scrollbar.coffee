class Scrollbar
  constructor: (track, content, margin) ->
    if typeof (track) != 'string'
      @track = $(track)
    else
      @track = track
    if typeof (track) != 'string'
      @content = $(content)
    else
      @content = content
    @disabled = false
    @margin = margin
    @handle = @track.find('.scrollbar_handle')
    @content_height = 0
    @handle_height = 0
    if @track.length ==0 and @content.length == 0 and @handle.length == 0
      return null
    @recalculate_layout()
    @bind()

  disable: ->
    @disabled = true
    @content.css({'overflow-y': 'auto', 'overflow-x': 'hidden'})
    @track.hide()

  enable: ->
    @disabled = false
    @content.css({'overflow-y': 'hidden', 'overflow-x': 'hidden'})
    @track.show()

  recalculate_layout: ->
    if @disabled
      return
    @content_height = @content.height()
    @track.css('height', (@content_height - (@track.outerHeight(true) - @track.outerHeight())) + 'px')
    @track_height = @track.height()
    if (@content.get(0).scrollHeight <= @content_height)
      @hide()
    else
      @show()
      @handle.css(
        'height', (@track_height * @content_height / @content.get(0).scrollHeight) + 'px')
    @handle_height = @handle.height()
    pos = @content.get(0).scrollTop * (@track_height - @handle_height) / @content.get(0).scrollHeight
    @handle.css('top', pos + 'px')
    return

  on_wheel: (ev) ->
    if @disabled
      return
    if event.wheelDeltaY > 1 or event.wheelDeltaY < -1
      if event.wheelDelta
        delta = event.wheelDelta / 2.5
      offsetY = (@content.get(0).offsetTop - delta)
      @scroll(offsetY)
      return false
    else
      return true

  activate: ->
    @on_active = true
    @track.addClass('active')

  deactivate: ->
    @on_active = false
    @track.removeClass('active')
    
  show: ->
    @track.show()

  hide: ->
    @track.hide()
    
  scroll_to: (pos) ->
    @content.get(0).scrollTop = pos

  scroll: (offset) ->
    pos = @content_pos_check(@content.get(0).scrollTop + offset)
    @content.get(0).scrollTop = pos

  scroll_by_handle: (pos) ->
    @handle.css('top', pos + 'px')
    @content.get(0).scrollTop = pos * @content.get(0).scrollHeight / (@track_height - @handle_height)

  handle_pos_check: (pos) ->
    if pos < 0
      pos = 0
    if pos > @track_height - @handle_height
      pos = @track_height - @handle_height
    return pos

  content_pos_check: (pos) ->
    if pos < 0
      pos = 0
    if pos > @content.get(0).scrollHeight
      pos = @content.get(0).scrollHeight
    return pos

  bind: ->
    @handle.mousedown( (ev) =>
      @activate()
      @track_scroll_y = ev.clientY - @track.get(0).offsetTop - @handle.get(0).offsetTop
      root._active_scrollbar = @
      return false
    ).mouseup( (ev) =>
      @deactivate()
    )

    @track.mousedown( (ev) =>
      @activate()
      pos = @handle_pos_check(ev.clientY - @track.offset().top - @handle_height*0.5)
      @scroll_by_handle(pos)
      return false
    ).mouseup( (ev) =>
      @deactivate()
    )
    @content.on('mousewheel', (ev) => @on_wheel ev)
    @content.on('DOMMouseScroll', (ev) => @on_wheel ev)
    @content.scroll( (ev) =>
      if not @on_active and not @disabled
        pos = @content.get(0).scrollTop * (@track_height - @handle_height) / @content.get(0).scrollHeight
        @handle.css('top', pos + 'px')
    )

  destory: ->
    @track.off()
    @track = null
    @handle.off()
    @handle = null
    @content.off()
    @content = null
  
root = exports ? this
root.widget = root.widget ? {}
root.widget.Scrollbar = Scrollbar
root.widget.Scrollbar.register = ->
    $(document).mousemove( (ev) =>
      # notify active scrollbar of its job
      if root._active_scrollbar
        sb = root._active_scrollbar
        if sb.on_active and not sb.disabled and sb.track_scroll_y
          pos = sb.handle_pos_check(ev.clientY - sb.track.get(0).offsetTop - sb.track_scroll_y)
          sb.scroll_by_handle(pos)
        return false
    ).mouseup( (ev) =>
      # notify active scrollbar of releasing mouse.
      if root._active_scrollbar
        sb = root._active_scrollbar
        sb.deactivate()
    )
    return

root._active_scrollbar = null
