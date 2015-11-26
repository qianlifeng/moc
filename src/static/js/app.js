(function () {
    var vue;

    function init() {
        Vue.component('tree', {
            props: ["model"],
            template: '#item-template',
            methods: {
                loadDoc: function (e, path) {
                    $(".doc-link").removeClass("active");
                    $(e.target).addClass("active");

                    $.post("/api/doc", {
                        "path": path
                    }, function (data) {
                        vue.doc = data;
                    });
                }
            }
        });

        vue = new Vue({
            el: 'body',
            data: {
                catalog: {},
                doc: ""
            },
            filters: {
                marked: marked
            }
        });


        loadCatalog();
    }

    function loadCatalog() {
        $.get("/api/catalog", function (data) {
            vue.catalog = data;
        });
    }

    init();
})();
