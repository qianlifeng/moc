(function () {
    var vue;

    function loadDoc(doc){
      if(doc.Children != null && doc.Children.length > 0) return;

      if(vue.isEditing){
        if(confirm("您正在编辑文档，确定放弃修改？")){
            vue.isEditing = false;
        }
        else{
          return;
        }
      }

      $(".doc-link").removeClass("active");
      $('[data-path="'+doc.Path+'"]').addClass("active");

      $.post("/api/doc", {
          "path": doc.Path
      }, function (data) {
          window.location.hash=doc.Name;
          window.document.title=doc.Name;
          vue.doc.markdown = data;
          vue.doc.path = doc.Path;
      });
    }

    function init() {
        Vue.component('tree', {
            props: ["model"],
            template: '#item-template',
            methods: {
                loadDoc: loadDoc
            }
        });

        vue = new Vue({
            el: 'body',
            data: {
                catalog: {},
                isEditing: false,
                doc: {
                  path:"",
                  markdown:""
                },
                config:{},
                toggleSidebar: false,
                togglePreview: false
            },
            filters: {
                marked: marked
            },
            methods:{
              edit:function(){
                vue.isEditing = true;
              },
              save:function(){
                $.post("/api/savedoc", {
                    "path": vue.doc.path,
                    "doc": vue.doc.markdown
                }, function (data) {
                    if(data.success){
                        vue.isEditing = false;
                        vue.togglePreview = false;
                    }
                    else{
                      alert("保存失败：" + data.error);
                    }
                });
              }
            }
        });


        loadCatalog();
        loadConfig();
    }

    function loadDocFromURLHash(){
      var name = window.location.hash;
      if(typeof name != "undefined" && name != null && name != ""){
          name = name.substr(1); //remove #
          var doc = findDocName(vue.catalog,name);
          if(typeof doc !== "undefined"){
              loadDoc(doc);
          }
      }
    }

    function findDocName(parentDoc,name){
      if(parentDoc.Name == name) return parentDoc;

      if(parentDoc.Children != null){
        for(var index in parentDoc.Children){
          return findDocName(parentDoc.Children[index],name);
        }
      }
    }

    function loadConfig(){
      $.get("/api/config", function (data) {
          vue.config = data;
      });
    }

    function loadCatalog() {
        $.get("/api/catalog", function (data) {
            vue.catalog = data;
            Vue.nextTick(function() {
                loadDocFromURLHash();
            });
        });
    }

    init();
})();
