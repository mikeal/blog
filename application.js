var frame = require('./frame/main.js');

var app = frame.createApplication('blog');

app.widgets.templates = [path.join(__dirname, 'templates')]
app.widgets.index = {
  template:"index",
}
app.widgets.post = {
  template:"post",
  handler:function (widget) {
    return frame.mustache.render({post:widget.doc})
  }
}

app.rest('.', function () {
  return {body:app.getWidget('index', {message:"hello world"})}
}, 0)

app.rest('posts', function (request, id) {
  app.couch.getDoc(id, function (error, doc) {
    if (error) {
      request.setResponse( frame.error404('no such post') );
    }
    request.setResponse({body:app.getWidget('post', {doc:doc})});
  });
})

