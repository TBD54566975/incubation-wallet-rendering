$("document").ready(function () {
  var aceId = $("#ace-editor").attr("id");
  var editor = ace.edit(aceId);
  editor.session.setMode("ace/mode/json");
  editor.setTheme("ace/theme/twilight");

  var selections = [
    {
      name: "Entity Styles",
      id: "entity-styles",
      path: "entity-styles.json",
    },
    {
      name: "Data Mapping Object With Text",
      id: "dmo-with-text",
      path: "dmo-with-text.json",
    },
    {
      name: "Data Mapping Object With Path",
      id: "dmo-with-path",
      path: "dmo-with-path.json",
    },
    {
      name: "Labelled Data Mapping Object With Path",
      id: "dmo-with-path",
      path: "dmo-with-path.json",
    },
    {
      name: "Labelled Data Mapping Object With Text",
      id: "ldmo-with-text",
      path: "dmo-with-text.json",
    },
  ];
});
