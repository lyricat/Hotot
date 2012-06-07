class Previewer
  constructor: (sel) ->
    @me = $(sel)
    @image = @me.find('.image')
    @link = @me.children('.image_wrapper')
    @close_btn = @me.children('.close')
    @visible = false
    @close_btn.click(=>
      @close()
    )
    @link.click( (ev) =>
      if ev.which != 1 && ev.which != 2
          @close()
          return
      if conf.vars.platform == 'Chrome'
          chrome.tabs.create(
            { url: @link.attr('href'), active: ev.which == 1 },
            ()->
          )
          @close()
          return false
      @close()
    )

  reset: () ->
    @reload_proc('image/ani_loading_bar.gif')
    @image.css('margin', '20px 0')

  reload: (image_url) ->
    @reset()
    @reload_proc(image_url)

  reload_proc: (image_url) ->
    preloader = new Image
    preloader.onload = () =>
      @image.attr('src', image_url)
      @image.css('margin', '0')
      width = preloader.width
      height = preloader.height
      if $(window).width() < width + 40
        width = $(window).width() - 40
        height = (width+.0)/preloader.width*preloader.height
      if $(window).height() < height + 70
        height = $(window).height() - 70
        width = (height+.0)/preloader.height*preloader.width
      @image.width(width)
      @image.height(height)
      @link.attr('href', image_url)
      @resize(width, height)
      preload = null
    preloader.src = image_url

  resize: (width, height) ->
    # resize previewer
    if width < 64
      width = 64
    if height < 64
      height = 64
    height += 30
    @me.width(width).height(height)
    @me.css({'margin-top': (0 - height)/2-10, 'margin-left': (0 - width)/2-10})

  open: () ->
    @visible = true
    @me.show()
    @me.transition({'opacity': 1}, 100)

  close: () ->
    @visible = false
    @me.transition({'opacity': 0}, 100, ()=>@me.hide())


root = exports ? this
root.widget = root.widget ? {}
root.widget.Previewer = Previewer

