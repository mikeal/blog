var couchapp = require('couchapp'),
    path = require('path');

var ddoc = {_id:'_design/app', views:{}, shows:{}, lists:{}, templates:{}, modules:{}}

couchapp.loadAttachments(ddoc, path.join(__dirname, 'static'));
couchapp.loadFiles(ddoc.templates, path.join(__dirname, 'templates'));
couchapp.loadModules(ddoc.modules, path.join(__dirname, 'modules'));
couchapp.loadFiles(ddoc, path.join(__dirname, 'modules'));

ddoc.blogconfig = {title:"write code. a blog.", author:"mikeal rogers", 
                   description:"mikeal's blog", 
                   meta:'Programming,HTML,CSS,JavaScript,CouchDB,node.js'
                   }

ddoc.rewrites = [
  {from:'/', to:'_list/index/posts', 
   query:{descending:true, limit:10, include_docs:true}
  },
  {from:'/all', to:'_list/all/posts',
   query:{descending:true, include_docs:true}
  },
  {from:'/static/*', to:'./*'},
  
  // This is where I should add reverse compat with an old wordpress blog
  
  {from:'/*', to:'_show/wildcard/*'},
  
]

ddoc.views.posts = {map: function (doc) {
  if (doc.type === 'blog-post') {
    emit(doc.timestamp, 1);
  }
}}


ddoc.lists.index = function (head, req) {
  var row;
  var mustache = require('modules/mustache');
  start({"code": 200, "headers": {"content-type":"text/html"}})
  send(mustache.to_html(this.templates['header.mustache'], this.blogconfig))  
  while(row = getRow()) {
    send(mustache.to_html(this.templates['index.mustache'], row.doc));
  }
  send(mustache.to_html(this.templates['header.mustache'], this.blogconfig))
}

exports.app = ddoc;