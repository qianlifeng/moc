(function () {
    var vue;

    function init() {
        vue = new Vue({
            el: 'body',
            data: {
                catalog: {},
                doc: ""
            },
            methods: {
                loadDoc: function (path) {
                    $.post("/api/doc", {
                        "path": path
                    }, function (data) {
                        vue.doc = data;
                    });
                }
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
