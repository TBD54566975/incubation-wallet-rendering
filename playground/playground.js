$("document").ready(function () {
  var exampleSelector = $("#example-selection");

  var createEditor = function () {
    var aceId = $("#ace-editor").attr("id");
    var editor = ace.edit(aceId);
    editor.session.setMode("ace/mode/json");
    editor.setTheme("ace/theme/twilight");
  };

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

  /*
   * event listener for change of selection on
   * example selector
   * */
  var onChangeSelection = function () {
    exampleSelector.change(function (v) {
      var selection = $(this);
      var path = selection.find(":selected").val();
      loadExample(path);
    });
  };

  /**
   * Loads and displays the example identified by the given name
   */
  var loadExample = function (example) {
    $.ajax({
      url: "examples/" + example,
      dataType: "text",
    })
      .done(function (code) {
        var aceId = $("#ace-editor").attr("id");
        var editor = ace.edit(aceId);
        editor.getSession().setValue(code);
      })
      .fail(function () {
        $("#result").html("Sorry, I could not retrieve the example!");
      });
  };

  var loadSelection = function () {
    var example = exampleSelector.find(":selected").val();
    loadExample(example);
  };

  var init = function () {
    createEditor();
    selections.forEach(function (v) {
      exampleSelector.append(new Option(v.name, v.path));
    });
    loadSelection();
    onChangeSelection();
  };

  init();
});
