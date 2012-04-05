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
    @margin = margin
    @handle = @track.find('.scrollbar_handle')
    @content_height = 0
    @handle_height = 0
    if @track.length ==0 and @content.length == 0 and @handle.length == 0
      return null
    @recalculate_layout()
    @bind()

  recalculate_layout: ->
    @content_height = @content.height()
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
    @track.css('height', (@content_height - (@track.outerHeight(true) - @track.outerHeight())) + 'px')
    return

  on_wheel: (ev) ->
    if event.wheelDelta
      delta = event.wheelDelta / 10
    offsetY = @offset_check(@handle.get(0).offsetTop - delta)
    @scroll_to(offsetY)
    return false

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
    @handle.css('top', pos + 'px')
    @content.get(0).scrollTop = pos * @content.get(0).scrollHeight / (@track_height - @handle_height)

  offset_check: (pos) ->
    if pos < 0
      pos = 0
    if pos > @track_height - @handle_height
      pos = @track_height - @handle_height
    return pos

  bind: ->
    @handle.mousedown( (ev) =>
      @activate()
      @scroll_drag_y = ev.clientY - @track.get(0).offsetTop - @handle.get(0).offsetTop
      root._active_scrollbar = @
      return false
    ).mouseup( (ev) =>
      @deactivate()
    )

    @track.mousedown( (ev) =>
      offsetY = @offset_check(ev.clientY - @track.get(0).offsetTop - @handle_height * 0.5)
      @scroll_to(offsetY)
    )
    @content.on('mousewheel', (ev) => @on_wheel ev)
    @content.on('DOMMouseScroll', (ev) => @on_wheel ev)
    @content.scroll( (ev) =>
      if not @on_active
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
        if sb.on_active
          offsetY = sb.offset_check(ev.clientY - sb.track.get(0).offsetTop - sb.scroll_drag_y)
          sb.scroll_to(offsetY)
        return false
    ).mouseup( (ev) =>
      # notify active scrollbar of releasing mouse.
      if root._active_scrollbar
        root._active_scrollbar.deactivate()
        root._active_scrollbar = null
    )
    return

root._active_scrollbar = null
