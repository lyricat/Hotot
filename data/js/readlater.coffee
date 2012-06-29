class ReadLater
  constructor: (@username, @password) ->
    @pocket_apikey = '4c2T7D4dg52f6r440gd746eW4cpkG7f6'
    @pocket_auth_url = 'https://readitlaterlist.com/v2/auth?username={%USERNAME%}&password={%PASSWORD%}&apikey='+@pocket_apikey
    @pocket_add_url = 'https://readitlaterlist.com/v2/add?username={%USERNAME%}&password={%PASSWORD%}&apikey='+@pocket_apikey+'&url={%URL%}&title={%SELECTION%}'
  
    @instap_auth_url = 'https://www.instapaper.com/api/authenticate?username={%USERNAME%}&password={%PASSWORD%}'

    @instapp_add_url = 'https://www.instapaper.com/api/add?username={%USERNAME%}&password={%PASSWORD%}&url={%URL%}&title=&selection={%SELECTION%}'

  init: (username, password)->
    @username = username
    @password = password

  addItem: (service, url, text, callback) ->
    if service == 'pocket'
      req_url = @pocket_add_url
    else          # instapp
      req_url = @instapp_add_url
    req_url = req_url.replace('{%USERNAME%}', encodeURIComponent(@username))
    req_url = req_url.replace('{%PASSWORD%}', encodeURIComponent(@password))
    req_url = req_url.replace('{%URL%}', encodeURIComponent(url))
    req_url = req_url.replace('{%SELECTION%}', encodeURIComponent(text))
    $.get(req_url, callback)
     

root = exports ? this
root.ReadLaterServ = ReadLater
