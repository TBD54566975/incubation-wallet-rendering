$("document").ready(function () {
  var exampleSelector = $("#example-selection");
  var dataAceEditorId = $("#data-editor-textarea").attr("id");
  var schemaAceEditorId = $("#schema-editor-textarea").attr("id");
  var dataEditor = ace.edit(dataAceEditorId);
  var schemaEditor = ace.edit(schemaAceEditorId);
  var schemaSelector = $("#schema-selection");

  var createEditors = function () {
    dataEditor.session.setMode("ace/mode/json");
    dataEditor.setTheme("ace/theme/twilight");
    schemaEditor.session.setMode("ace/mode/json");
    schemaEditor.setTheme("ace/theme/twilight");
  };

  var schemas = [
    {
      name: "Entity Style Schema",
      path: "entity_styles.json",
    },
    {
      name: "Getting Started Schema",
      path: "getting-started.json",
    },
    {
      name: "Credential Manifest Schema",
      path: "credential-manifest.json",
    },

    {
      name: "Credential Response Schema",
      path: "credential-response.json",
    },

    {
      name: "Display Mapping Object",
      path: "display_mapping_object.json",
    },

    {
      name: "Labelled Display Mapping Object",
      path: "labelled_display_mapping_object.json",
    },
    {
      name: "Output Descriptors",
      path: "output-descriptors.json",
    },
  ];

  var selections = [
    {
      name: "Entity Styles Examples",
      id: "entity-styles",
      path: "entity-styles.json",
    },
    {
      name: "Getting Started Exmple",
      id: "getting-started",
      path: "getting-started.json",
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

  /*
   * TODO Refacotr this
   * event listener for change of selection on
   * schema selector
   * */
  var onChangeSchemaSelection = function () {
    schemaSelector.change(function (v) {
      var selection = $(this);
      var path = selection.find(":selected").val();
      loadSchema(path);
    });
  };

  /**
   * Loads and displays the schema identified by the given name
   */
  var loadSchema = function (path) {
    $.ajax({
      url: "../schemas/" + path,
      dataType: "text",
    })
      .done(function (code) {
        schemaEditor.getSession().setValue(code);
      })
      .fail(function () {
        $("#result").html("Sorry, I could not retrieve the schema!");
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
        dataEditor.getSession().setValue(code);
      })
      .fail(function () {
        $("#result").html("Sorry, I could not retrieve the example!");
      });
  };

  /*
   * Initalize the playground
   */
  var init = function () {
    createEditors();

    selections.forEach(function (v) {
      exampleSelector.append(new Option(v.name, v.path));
    });

    schemas.forEach(function (v) {
      schemaSelector.append(new Option(v.name, v.path));
    });

    // const defaultSchema = "credential-manifest.json";
    // const defaultData = "cm-all-features.json";
    const defaultData = "cm-all-features.json";
    const defaultSchema = "credential-manifest.json";

    exampleSelector.val(defaultData);

    var example = exampleSelector.find(":selected").val();
    loadExample(example);
    onChangeSelection();

    schemaSelector.val(defaultSchema);
    var schema = schemaSelector.find(":selected").val();
    loadSchema(schema);
    onChangeSchemaSelection();
  };

  dataEditor.getSession().on("change", function () {
    updateRender();
  });

  schemaEditor.getSession().on("change", function () {
    updateRender();
  });

  /*
   * Calls the walletrender .render()
   * method with data based upon the contents of the
   * dataEditor.
   */
  var updateRender = function () {
    var target = $("#results-container");
    try {
      var data = JSON.parse(dataEditor.getSession().getValue());
      var schema = JSON.parse(schemaEditor.getSession().getValue());
      console.log("rendering schema");
      target.credentialRender({
        data: data,
        schema: schema,
      });
    } catch (error) {
      target.html(error);
    }
  };

  init();
});
