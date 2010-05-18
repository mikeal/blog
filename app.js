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
  
  {from:'/:k', to:'_list/wildcard/wildcard',
   query:{startkey:[':k', {}], endkey:[':k', null], descending:true, include_docs:true}, 
  },
  
]

ddoc.views.posts = {map: function (doc) {
  if (doc.type === 'blog-post') {
    emit(doc.timestamp, 1);
  }
}}
ddoc.views.wildcard = {map: function (doc) {
  if (doc.type === 'blog-post') {
    emit([doc._id, "Z"], 1);
    emit([doc.title.replace(/[^a-zA-Z 0-9]+/g,'').replace(/ /g, '_').toLowerCase() ,"Z"], 1);
  } else if (doc.type == 'blog-comment') {
    emit([doc['blog-id'], doc.timestamp], 1);
    // emit([doc['blog-title'].replace(/[^a-zA-Z 0-9]+/g,'').replace(/ /g, '_').toLowerCase() ,doc.timestamp], 1);
  }
}}

ddoc.lists.wildcard = function (head, req) {
  var mustache = require('modules/mustache');
  start({"code": 200, "headers": {"content-type":"text/html"}})
  var row = getRow();
  send(mustache.to_html(this.templates['header.mustache'], this.blogconfig))  
  row.doc.linkTitle = row.doc.title.replace(/[^a-zA-Z 0-9]+/g,'').replace(/ /g, '_').toLowerCase();
  send('<div class="wildcard-content-container">')
  send(mustache.to_html(this.templates['blogpost.mustache'], row.doc));
  while(row = getRow()) {
    // send(mustache.to_html(this.templates['blogcomment.mustache'], row.doc));
  }
  send('</div>')
  send(mustache.to_html(this.templates['wildcardfooter.mustache'], this.blogconfig))
}

ddoc.lists.index = function (head, req) {
  var row;
  var mustache = require('modules/mustache');
  start({"code": 200, "headers": {"content-type":"text/html"}})
  send(mustache.to_html(this.templates['header.mustache'], this.blogconfig))  
  send('<div class="index-content-container">')
  while(row = getRow()) {
    row.doc.linkTitle = row.doc.title.replace(/[^a-zA-Z 0-9]+/g,'').replace(/ /g, '_').toLowerCase();
    send(mustache.to_html(this.templates['blogpost.mustache'], row.doc));
  }
  send('</div>')
  send(mustache.to_html(this.templates['footer.mustache'], this.blogconfig))
}

exports.app = ddoc;