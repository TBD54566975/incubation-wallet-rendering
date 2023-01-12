$("document").ready(function () {
  var aceId = $("#ace-editor").attr("id");
  var editor = ace.edit(aceId);
  editor.session.setMode("ace/mode/json");
  editor.setTheme("ace/theme/twilight");
});
