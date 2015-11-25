(function(){

   var vue;
    function init(){
        vue = new Vue({
            el: 'body',
            data: {
                catalog: {}
            }
        });

        loadCatalog();
    }

    function loadCatalog(){
        $.get("/api/catalog",function(data){
          vue.catalog = data;
        });
    }

    init();
})();
