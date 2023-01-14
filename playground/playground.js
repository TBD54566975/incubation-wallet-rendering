$("document").ready(function () {
  var exampleSelector = $("#example-selection");
  var aceId = $("#ace-editor").attr("id");
  var editor = ace.edit(aceId);

  var createEditor = function () {
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
    {
      name: "Credential Manifest All Features",
      id: "cm-all-features",
      path: "cm-all-features.json",
    },
    {
      name: "Credential Manifest Appendix JWT",
      id: "cm-appendix-jwt",
      path: "cm-appendix-jwt.json",
    },
    {
      name: "Credential Manifest Application Sample",
      id: "cm-application-sample",
      path: "cm-application-sample.json",
    },
    {
      name: "Credential Manifest Sample Fullfillment",
      id: "cm-sample-fullfillment",
      path: "cm-sample-fullfillment.json",
    },
    {
      name: "Credential Manifest Sample Denial",
      id: "cm-sample-denial",
      path: "cm-sample-denial.json",
    },
    {
      name: "Credential Manifest Response Appendix JWT",
      id: "cr-appendix-jwt",
      path: "cr-appendix-jwt.json",
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

  /*
   * Initalize the playground
   */
  var init = function () {
    createEditor();
    selections.forEach(function (v) {
      exampleSelector.append(new Option(v.name, v.path));
    });
    var example = exampleSelector.find(":selected").val();
    loadExample(example);
    onChangeSelection();
  };

  editor.getSession().on("change", function () {
    updateRender();
  });
  /*
   * Calls the walletrender .render()
   * method with data based upon the contents of the
   * editor.
   */
  var updateRender = function () {
    var target = $("#results-container");
    try {
      var aceId = $("#ace-editor").attr("id");
      var data = JSON.parse(editor.getSession().getValue());
      target.walletRender({
        data: data,
      });
    } catch (error) {
      target.html(error);
      console.log(error);
    }
  };

  init();
});
