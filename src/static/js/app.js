(function() {
    var vue;

    function loadDoc(doc) {
        if (doc.Children != null && doc.Children.length > 0) return;

        if (vue.isEditing) {
            if (confirm("您正在编辑文档，确定放弃修改？")) {
                vue.isEditing = false;
            } else {
                return;
            }
        }

        $(".doc-link").removeClass("active");
        $('[data-path="' + doc.Path + '"]').addClass("active");

        $.post("/api/doc", {
            "path": doc.Path
        }, function(data) {
            window.location.hash = doc.Name;
            window.document.title = doc.Name;
            vue.doc.markdown = data;
            vue.doc.path = doc.Path;
        });
    }

    function addNewFolder(doc, name) {
        swal({
            title: "假动作!!!",
            imageUrl: "http://yun.baozoumanhua.com/Project/RageMaker0/images/0/11.png"
        });
    }

    function addNewFile(doc, name) {
        swal({
            title: "假动作!!!",
            imageUrl: "http://yun.baozoumanhua.com/Project/RageMaker0/images/0/11.png"
        });
    }

    function init() {
        Vue.component('tree', {
            props: ["model"],
            template: '#item-template',
            methods: {
                loadDoc: loadDoc,
                rename: function(doc) {
                    swal({
                        title: "假动作!!!",
                        imageUrl: "http://yun.baozoumanhua.com/Project/RageMaker0/images/0/11.png"
                    });
                },
                addNew: function(doc) {
                    swal({
                        title: "What do you want to add?",
                        showCancelButton: true,
                        allowEscapeKey: false,
                        imageUrl: "/images/question.png",
                        confirmButtonColor: "#337ab7",
                        cancelButtonText: "Add file",
                        confirmButtonText: "Add folder",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    }, function(isConfirm) {
                        if (isConfirm) {
                            //add Folder
                            swal({
                                title: "Input folder name",
                                type: "input",
                                imageUrl: "/images/folder.png",
                                showCancelButton: true,
                                closeOnConfirm: false,
                            }, function(inputValue) {
                                if (inputValue === false) return false;
                                if (inputValue === "") {
                                    swal.showInputError("Please input folder name");
                                    return false
                                }
                                addNewFolder(doc, inputValue);
                            });
                        } else {
                            //add File
                            swal({
                                title: "Input file name",
                                type: "input",
                                imageUrl: "/images/file.png",
                                showCancelButton: true,
                                closeOnConfirm: false,
                            }, function(inputValue) {
                                if (inputValue === false) return false;
                                if (inputValue === "") {
                                    swal.showInputError("Please input file name");
                                    return false
                                }
                                addNewFile(doc, inputValue);
                            });
                        }
                    });
                }
            }
        });

        marked.setOptions({
            highlight: function(code) {
                return hljs.highlightAuto(code).value;
            }
        });

        vue = new Vue({
            el: 'body',
            data: {
                catalog: {},
                isEditing: false,
                doc: {
                    path: "",
                    markdown: ""
                },
                config: {},
                toggleSidebar: false,
                togglePreview: false
            },
            filters: {
                marked: marked
            },
            methods: {
                edit: function() {
                    vue.isEditing = true;
                },
                save: function() {
                    $.post("/api/savedoc", {
                        "path": vue.doc.path,
                        "doc": vue.doc.markdown
                    }, function(data) {
                        if (data.success) {
                            vue.isEditing = false;
                            vue.togglePreview = false;
                        } else {
                            alert("保存失败：" + data.error);
                        }
                    });
                }
            }
        });


        loadCatalog();
        loadConfig();
    }

    function loadDocFromURLHash() {
        var name = window.location.hash;
        if (typeof name != "undefined" && name != null && name != "") {
            name = name.substr(1); //remove #
            var doc = findDocName(vue.catalog, name);
            if (typeof doc !== "undefined") {
                loadDoc(doc);
            }
        }
    }

    function findDocName(parentDoc, name) {
        if (parentDoc.Name == name) return parentDoc;

        if (parentDoc.Children != null) {
            for (var index in parentDoc.Children) {
                var doc = findDocName(parentDoc.Children[index], name);
                if (typeof doc !== "undefined") {
                    return doc;
                }
            }
        }
    }

    function loadConfig() {
        $.get("/api/config", function(data) {
            vue.config = data;
        });
    }

    function loadCatalog() {
        $.get("/api/catalog", function(data) {
            vue.catalog = data;
            Vue.nextTick(function() {
                loadDocFromURLHash();
            });
        });
    }

    init();
})();
