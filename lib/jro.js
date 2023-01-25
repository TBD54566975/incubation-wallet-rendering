/*
 * @license: Apache-2.0 license
 * @license_url: https://github.com/TBD54566975/incubation-wallet-rendering/blob/main/LICENSE
 * @title: Wallet Rendering Library
 * @fileoverview: Library for wallet rendering specification on DIF to render suggestions to users.
 * @repository_url: https://github.com/TBD54566975/incubation-wallet-rendering
 * @maintainers: andor@benri.io
 * @description: This library is a flexible and vanilla js implementation of
 *    the specifications done at the Decentralized Identity Foundation provided at
 *    https://identity.foundation/wallet-rendering/
 *
 *    It specifies how an issuer of Verifiable Credentials can make generic,
 *    high-level rendering suggestions to wallets and consumers of the credentials,
 *    working on the model of "style guides" for other credential formats
 * @usage: To use please follow the following steps:
 *    1. add this library to your application
 *    2. invoke the walletRender global function. i.e
 *    document.getElementById("viz").walletRender({
 *      data: dataobj,
 *    })
 * @acknowledgments: This implementation was heavily inspired by:
 *    https://github.com/jsonform/jsonform/blob/master/lib/jsonform.js
 */

/*global window*/

(function (serverside, global, $, _, JSON) {
  if (serverside && !_) {
    _ = require("underscore");
  }

  /**
   * Regular expressions used to extract array indexes in input field names
   */
  var reArray = /\[([0-9]*)\](?=\[|\.|$)/g;

  const defaultElementPrefix = "walletrender";
  const rootName = "root";

  var render = { util: {} };

  render.elementTypes = {
    root: {
      template: "<div><%= children %></div>",
    },
    none: {
      template: "",
    },
    string: {
      template: "<div><%= value %/></div>",
    },
    image: {
      template: "<div>" + '<img src="<%=node.src %>" id="<%= id %>"/>',
    },
    text: {
      template: "<div>" + '<img src="<%= value %>" id="<%= id %>"/>',
    },
  };

  /**
   * Returns true if given value is neither "undefined" nor null
   */
  var isSet = function (value) {
    return !(_.isUndefined(value) || _.isNull(value));
  };

  //Allow to access subproperties by splitting "."
  /**
   * Retrieves the key identified by a path selector in the structured object.
   *
   * Levels in the path are separated by a dot. Array items are marked
   * with [x]. For instance:
   *  foo.bar[3].baz
   *
   * @function
   * @param {Object} obj Structured object to parse
   * @param {String} key Path to the key to retrieve
   * @param {boolean} ignoreArrays True to use first element in an array when
   *   stucked on a property. This parameter is basically only useful when
   *   parsing a JSON schema for which the "items" property may either be an
   *   object or an array with one object (only one because JSON form does not
   *   support mix of items for arrays).
   * @return {Object} The key's value.
   */
  render.util.getObjKey = function (obj, key, ignoreArrays) {
    var innerobj = obj;
    var keyparts = key.split(".");
    var subkey = null;
    var arrayMatch = null;
    var prop = null;

    for (var i = 0; i < keyparts.length; i++) {
      if (innerobj === null || typeof innerobj !== "object") return null;
      subkey = keyparts[i];
      prop = subkey.replace(reArray, "");
      reArray.lastIndex = 0;
      arrayMatch = reArray.exec(subkey);
      if (arrayMatch) {
        while (true) {
          if (prop && !_.isArray(innerobj[prop])) return null;
          innerobj = prop
            ? innerobj[prop][parseInt(arrayMatch[1])]
            : innerobj[parseInt(arrayMatch[1])];
          arrayMatch = reArray.exec(subkey);
          if (!arrayMatch) break;
          // In the case of multidimensional arrays,
          // we should not take innerobj[prop][0] anymore,
          // but innerobj[0] directly
          prop = null;
        }
      } else if (
        ignoreArrays &&
        !innerobj[prop] &&
        _.isArray(innerobj) &&
        innerobj[0]
      ) {
        innerobj = innerobj[0][prop];
      } else {
        innerobj = innerobj[prop];
      }
    }

    if (ignoreArrays && _.isArray(innerobj) && innerobj[0]) {
      return innerobj[0];
    } else {
      return innerobj;
    }
  };

  /**
   * Sets the key identified by a path selector to the given value.
   *
   * Levels in the path are separated by a dot. Array items are marked
   * with [x]. For instance:
   *  foo.bar[3].baz
   *
   * The hierarchy is automatically created if it does not exist yet.
   *
   * @function
   * @param {Object} obj The object to build
   * @param {String} key The path to the key to set where each level
   *  is separated by a dot, and array items are flagged with [x].
   * @param {Object} value The value to set, may be of any type.
   */
  render.util.setObjKey = function (obj, key, value) {
    var innerobj = obj;
    var keyparts = key.split(".");
    var subkey = null;
    var arrayMatch = null;
    var prop = null;

    for (var i = 0; i < keyparts.length - 1; i++) {
      subkey = keyparts[i];
      prop = subkey.replace(reArray, "");
      reArray.lastIndex = 0;
      arrayMatch = reArray.exec(subkey);
      if (arrayMatch) {
        // Subkey is part of an array
        while (true) {
          if (!_.isArray(innerobj[prop])) {
            innerobj[prop] = [];
          }
          innerobj = innerobj[prop];
          prop = parseInt(arrayMatch[1], 10);
          arrayMatch = reArray.exec(subkey);
          if (!arrayMatch) break;
        }
        if (typeof innerobj[prop] !== "object" || innerobj[prop] === null) {
          innerobj[prop] = {};
        }
        innerobj = innerobj[prop];
      } else {
        // "Normal" subkey
        if (typeof innerobj[prop] !== "object" || innerobj[prop] === null) {
          innerobj[prop] = {};
        }
        innerobj = innerobj[prop];
      }
    }

    // Set the final value
    subkey = keyparts[keyparts.length - 1];
    prop = subkey.replace(reArray, "");
    reArray.lastIndex = 0;
    arrayMatch = reArray.exec(subkey);
    if (arrayMatch) {
      while (true) {
        if (!_.isArray(innerobj[prop])) {
          innerobj[prop] = [];
        }
        innerobj = innerobj[prop];
        prop = parseInt(arrayMatch[1], 10);
        arrayMatch = reArray.exec(subkey);
        if (!arrayMatch) break;
      }
      innerobj[prop] = value;
    } else {
      innerobj[prop] = value;
    }
  };

  /**
   * Retrieves the key definition from the given schema.
   *
   * The key is identified by the path that leads to the key in the
   * structured object that the schema would generate. Each level is
   * separated by a '.'. Array levels are marked with []. For instance:
   *  foo.bar[].baz
   * ... to retrieve the definition of the key at the following location
   * in the JSON schema (using a dotted path notation):
   *  foo.properties.bar.items.properties.baz
   *
   * @function
   * @param {Object} schema The JSON schema to retrieve the key from
   * @param {String} key The path to the key, each level being separated
   *  by a dot and array items being flagged with [].
   * @return {Object} The key definition in the schema, null if not found.
   */
  var getSchemaKey = function (schema, key) {
    var schemaKey = key
      .replace(/\./g, ".properties.")
      .replace(/\[[0-9]*\]/g, ".items");
    var schemaDef = render.util.getObjKey(schema, schemaKey, true);
    if (schemaDef && schemaDef.$ref) {
      throw new Error(
        "Wallet Rendering does not yet support schemas that use the " +
          "$ref keyword."
      );
    }
    return schemaDef;
  };

  /**
   *
   * Slugifies a string by replacing spaces with _. Used to create
   * valid classnames and ids for the render.
   *
   * @function
   * @param {String} str The string to slugify
   * @return {String} The slugified string.
   */
  var slugify = function (str) {
    return str.replace(/\ /g, "_");
  };

  /**
   * Escapes selector name for use with jQuery
   *
   * All meta-characters listed in jQuery doc are escaped:
   * http://api.jquery.com/category/selectors/
   *
   * @function
   * @param {String} selector The jQuery selector to escape
   * @return {String} The escaped selector.
   */
  var escapeSelector = function (selector) {
    return selector.replace(
      /([ \!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g,
      "\\$1"
    );
  };

  // From backbonejs
  var escapeHTML = function (string) {
    if (!isSet(string)) {
      return "";
    }
    string = "" + string;
    if (!string) {
      return "";
    }
    return string
      .replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  };

  /**
   * Returns true if given property is directly property of an object
   */
  var hasOwnProperty = function (obj, prop) {
    return typeof obj === "object" && obj.hasOwnProperty(prop);
  };

  /*
   * The WR is represented internally as a tree
   * which allows us individually interact with each element
   * as a node. This allows better flexibility across configuration
   * of the nodes
   */
  var Tree = function () {
    this.eventhandlers = [];
    this.root = null;
    this.description = null;
  };

  /**
   * Renders the tree
   *
   * @function
   * @param {Node} domRoot The "form" element in the DOM tree that serves as
   *  root for the form
   */
  Tree.prototype.render = function (domRoot) {
    if (!domRoot) return;
    this.domRoot = domRoot;
    this.root.render();
  };

  Tree.prototype.initialize = function (description) {
    description = description || {};
    this.description = _.clone(description);

    // Compute element prefix if no prefix is given.
    this.description.prefix =
      this.description.prefix || defaultElementPrefix + _.uniqueId();

    this.description.params = this.description.params || {};

    // Create the root of the tree
    this.root = new Node();
    this.root.ownerTree = this;
    this.root.view = render.elementTypes[rootName];

    // Generate the tree from the descriptors
    this.buildTree();
    console.log("build tree, computing values");
    this.computeInitialValues();
    console.log("new tree is ", this);
  };

  /*
   * Computes the values associated with each field on the tree
   * based upon submitted values or default values in the JSON schema
   *
   */
  Tree.prototype.computeInitialValues = function () {
    this.root.computeInitialValues(this.description);
  };

  /**
   * Walks down the element tree with a callback
   *
   * @function
   * @param {Function} callback The callback to call on each element
   */
  Tree.prototype.forEachElement = function (callback) {
    var f = function (root) {
      for (var i = 0; i < root.children.length; i++) {
        callback(root.children[i]);
        f(root.children[i]);
      }
    };
    f(this.root);
  };

  /* TODO
   * constructs the tree from the JSON
   *
   * The function must be called once when the tree is first created.
   *
   * @function
   */
  Tree.prototype.buildTree = function () {
    // Parse and generate the form structure based on the elements encountered:
    // - '*' means "generate all possible fields using default layout"
    // - a key reference to target a specific data element
    // - a more complex object to generate specific form sections
    _.each(
      this.description.schema.properties,
      function (wrEl, key) {
        if (wrEl === "*") {
          _.each(
            this.schema.properties,
            function (element, key) {
              this.root.appendChild(
                this.buildFromLayout({
                  key: key,
                })
              );
            },
            this
          );
        } else {
          if (_.isString(wrEl)) {
            wrEl = {
              key: key,
            };
          }
          wrEl.key = key; // TODO : Fix
          this.root.appendChild(this.buildFromLayout(wrEl));
        }
      },
      this
    );
  };

  /*
   * TODO
   * Builds the internal wr tree representation from the requested layout.
   *
   * The function is recursive, generating the node children as necessary.
   *
   * @function
   * @param {Object} element The element to render
   * @param {Object} context The parsing context (the array depth in particular)
   * @return {Object} The node that matches the element.
   */
  Tree.prototype.buildFromLayout = function (renderEl, context) {
    var schemaElement = null;
    var node = new Node();
    var view = null;
    var key = null;

    // The element parameter directly comes from the initial
    // object. We'll make a shallow copy of it and of its children
    // not to pollute the original object.
    // (note JSON.parse(JSON.stringify()) cannot be used since there may be
    // event handlers in there!)
    renderEl = _.clone(renderEl);

    if (renderEl.items) {
      if (_.isArray(renderEl.items)) {
        renderEl.items = _.map(renderEl.items, _.clone);
      } else {
        renderEl.items = [_.clone(renderEl.items)];
      }
    }

    if (renderEl.key) {
      // The element is directly linked to an element in the JSON
      // schema. The properties of the form element override those of the
      // element in the JSON schema. Properties from the JSON schema complete
      // those of the form element otherwise.

      // Retrieve the element from the JSON schema
      // FIXME: add support for $ref
      var kk = renderEl.key
        .replace(/\./g, ".properties.")
        .replace(/\[[0-9]*\]/g, ".items");

      var schemaDef = render.util.getObjKey(
        this.description.schema.properties,
        kk,
        true
      );
      if (schemaDef && schemaDef.$ref) {
        return null;
      }

      schemaElement = getSchemaKey(
        this.description.schema.properties,
        renderEl.key
      );

      if (!schemaElement) {
        // The render is invalid!
        throw new Error(
          'The Rendering object references the schema key "' +
            el.key +
            '" but that key does not exist in the JSON schema'
        );
      }

      renderEl.name = renderEl.name || renderEl.key;
      renderEl.title = renderEl.title || schemaElement.title;
      renderEl.description = renderEl.description || schemaElement.description;

      // Compute the ID of the input field
      if (!renderEl.id) {
        renderEl.id =
          escapeSelector(this.description.prefix) +
          "-elt-" +
          slugify(renderEl.key);
      }

      // If the form element does not define its type, use the type of
      // the schema element.
      if (!renderEl.type) {
        // If schema type is an array containing only a type and "null",
        // remove null and make the element non-required
        if (_.isArray(schemaElement.type)) {
          if (_.contains(schemaElement.type, "null")) {
            schemaElement.type = _.without(schemaElement.type, "null");
            schemaElement.required = false;
          }
          if (schemaElement.type.length > 1) {
            throw new Error(
              "Cannot process schema element with multiple types."
            );
          }
          schemaElement.type = _.first(schemaElement.type);
        }

        if (
          schemaElement.type === "string" &&
          schemaElement.format === "color"
        ) {
          renderEl.type = "color";
        } else if (
          (schemaElement.type === "number" ||
            schemaElement.type === "integer") &&
          !schemaElement["enum"]
        ) {
          renderEl.type = "number";
          if (schemaElement.type === "number") schemaElement.step = "any";
        } else if (
          (schemaElement.type === "string" || schemaElement.type === "any") &&
          !schemaElement["enum"]
        ) {
          renderEl.type = "text";
        } else if (schemaElement.type === "boolean") {
          renderEl.type = "checkbox";
        } else if (schemaElement.type === "object") {
          if (schemaElement.properties) {
            renderEl.type = "fieldset";
          } else {
            renderEl.type = "textarea";
          }
        } else if (!_.isUndefined(schemaElement["enum"])) {
          renderEl.type = "select";
        } else {
          renderEl.type = schemaElement.type;
        }
      }

      // If the element targets an "object" in the JSON schema,
      // we need to recurse through the list of children to create an
      // input field per child property of the object in the JSON schema
      if (schemaElement.type === "object") {
        _.each(
          schemaElement.properties,
          function (prop, propName) {
            var child = this.buildFromLayout({
              key: el.key + "." + propName,
            });
            if (child) {
              node.appendChild(child);
            }
          },
          this
        );
      }
    }

    if (!renderEl.type) {
      renderEl.type = "none";
    }

    view = render.elementTypes[renderEl.type];
    if (!view) {
      throw new Error(
        'The Render contains an element whose type is unknown: "' +
          renderEl.type +
          '"'
      );
    }

    // A few characters need to be escaped to use the ID as jQuery selector
    renderEl.iddot = escapeSelector(renderEl.id || "");

    // Initialize the form node from the form element and schema element
    node.renderEl = renderEl;
    node.schemaElement = schemaElement;
    node.view = view;
    node.ownerTree = this;
    // Set event handlers
    if (!renderEl.handlers) {
      renderEl.handlers = {};
    }

    return node;
  };
  /*
   * Represents a node in the data model
   *
   * Nodes that have an ID are linked to the corresponding DOM element
   * when rendered
   *
   */
  var Node = function () {
    this.id = null; // nodes id
    this.key = null; // key path
    this.el = null; // DOM element associated with node. Set on render
    this.schemaEl = null; // schema element
    this.renderEl = null;
    this.children = []; // subtree of node
    this.parentNode = null; // parent
    this.ownerTree = null; // tree that this node sits on
    this.view = null; //Pointer to the "view" associated with the node
    this.root = null;
  };

  /**
   * Attaches a child node to the current node.
   *
   * The child node is appended to the end of the list.
   *
   * @function
   * @param {Node} node The child node to append
   * @return {Node} The inserted node (same as the one given as parameter)
   */
  Node.prototype.appendChild = function (node) {
    node.parentNode = this;
    node.childPos = this.children.length;
    this.children.push(node);
    return node;
  };

  /**
   * Removes the last child of the node.
   *
   * @function
   */
  Node.prototype.removeChild = function () {
    var child = this.children[this.children.length - 1];
    if (!child) return;

    // Remove the child from the DOM
    $(child.el).remove();

    // Remove the child from the array
    return this.children.pop();
  };

  /*
   * Renders the node
   *
   * Rendering is done in three steps.
   *
   * 1. HTML Generation
   * 2. DOM Creation
   * 3. Enhancement, which binds event handlers
   */
  Node.prototype.render = function (el) {
    var html = this.generate();
    console.log("generated html:", html, this);
    // this.setContent(html, el);
    //this.enhance();
  };

  Node.prototype.enhance = function () {
    var node = this;
    var handlers = null;
    var handler = null;

    if (this.renderEl) {
      // Check the view associated with the node as it may define an "onInsert"
      // event handler to be run right away
      if (this.view.onInsert) {
        this.view.onInsert({ target: $(this.el) }, this);
      }

      handlers = this.handlers || this.renderEl.handlers;

      // Trigger the "insert" event handler
      handler = this.onInsert || this.renderEl.onInsert;
      if (handler) {
        handler({ target: $(this.el) }, this);
      }
      if (handlers) {
        _.each(
          handlers,
          function (handler, onevent) {
            if (onevent === "insert") {
              handler({ target: $(this.el) }, this);
            }
          },
          this
        );
      }

      if (this.el) {
        if (this.el.onChange)
          $(this.el).bind("change", function (evt) {
            node.formElement.onChange(evt, node);
          });
      }
    }

    console.log(this.el);
    // Recurse down the tree to enhance children
    _.each(this.children, function (child) {
      child.enhance();
    });
  };

  /**
   * Clones a node
   *
   * @function
   * @param {Node} New parent node to attach the node to
   * @return {Node} Cloned node
   */
  Node.prototype.clone = function (parentNode) {
    var node = new treeNode();
    node.ownerTree = this.ownerTree;
    node.parentNode = parentNode || this.parentNode;
    node.view = this.view;
    node.children = _.map(this.children, function (child) {
      return child.clone(node);
    });
    return node;
  };

  /*
   * Updates the DOM element associated with the node
   *
   * Only nodes that have ID are directly associated with a DOM element.
   *
   * @function
   */
  Node.prototype.updateElement = function (domNode) {
    console.log("updating ", domNode);
    return;
    if (this.id) {
      this.el = $("#" + escapeSelector(this.id), domNode).get(0);
      if (this.view && this.view.getElement) {
        this.el = this.view.getElement(this.el);
      }
      if (
        this.fieldtemplate !== false &&
        this.view &&
        this.view.fieldtemplate
      ) {
        // The field template wraps the element two or three level deep
        // in the DOM tree, depending on whether there is anything prepended
        // or appended to the input field
        this.el = $(this.el).parent().parent();
        if (this.prepend || this.prepend) {
          this.el = this.el.parent();
        }
        this.el = this.el.get(0);
      }
      if (
        this.parentNode &&
        this.parentNode.view &&
        this.parentNode.view.childTemplate
      ) {
        // TODO: Revisit
        this.el = $(this.el).parent().get(0);
      }
      //TODO
    }
    for (const k in this.children) {
      if (this.children.hasOwnProperty(k) == false) {
        continue;
      }
      this.children[k].updateElement(this.el || domNode);
    }
  };

  /*
   * Inserts/Updates the HTML content of the node in the DOM.
   *
   *
   * If the HTML is an update, the new HTML content replaces the old one.
   * The new HTML content is not moved around in the DOM in particular.
   */
  Node.prototype.setContent = function (html, parentEl) {
    var node = $(html);
    console.log("Node is ", node, "parent is ", parentEl, "html is ", html);

    var parentNode =
      parentEl ||
      (this.parentNode ? this.parentNode.el : this.ownerTree.domRoot);
    var nextSibling = null;

    let tJ = JSON.stringify(Node);
    $(parentNode).html("Rendering Is Currently Not Available: " + tJ);

    if (this.el) {
      // Replace the contents of the DOM element if the node is already in the tree
      $(this.el).replaceWith(node);
    } else {
      // Insert the node in the DOM if it's not already there
      nextSibling = $(parentNode).children().get(this.childPos);
      if (nextSibling) {
        $(nextSibling).before(node);
      } else {
        $(parentNode).append(node);
      }
    }
    this.el = node;
    console.log("setting node", node);
    this.updateElement(this.el);
  };

  /*
   * Sets the value of all nodes based upon submitted values
   * or default
   */
  Node.prototype.computeInitialValues = function (values) {
    var self = this;
    var node = null;
    var nbChildren = 1;
    var i = 0;
    var data = this.ownerTree.description.tpldata || {};
    console.log("coputing initial values", values);

    // Propagate the array path from the parent node
    // (adding the position of the child for nodes that are direct
    // children of array-like nodes)
    if (this.parentNode) {
      this.arrayPath = _.clone(this.parentNode.arrayPath);
      if (this.parentNode.view && this.parentNode.view.array) {
        this.arrayPath.push(this.childPos);
      }
    } else {
      this.arrayPath = [];
    }

    // Prepare special data param "idx" for templated values
    // (is is the index of the child in its wrapping array, starting
    // at 1 since that's more human-friendly than a zero-based index)
    data.idx =
      this.arrayPath.length > 0
        ? this.arrayPath[this.arrayPath.length - 1] + 1
        : this.childPos + 1;

    // Prepare special data param "value" for templated values
    console.log("setting value");
    data.value = "";
    // Prepare special function to compute the value of another field
    data.getValue = function (key) {
      if (!values) {
        return "";
      }
      var returnValue = values;
      var listKey = key.split("[].");
      var i;
      for (i = 0; i < listKey.length - 1; i++) {
        returnValue = returnValue[listKey[i]][self.arrayPath[i]];
      }
      return returnValue[listKey[i]];
    };

    var ignoreDefaultValues = false;
    // Case 3 and in any case: recurse through the list of children
    _.each(this.children, function (child) {
      child.computeInitialValues(values, ignoreDefaultValues);
    });
  };

  /*
   * Generates view's HTML content for the model
   *
   * @function
   */
  Node.prototype.generate = function () {
    var data = {
      id: this.id,
      el: this.el,
      node: this,
      value: isSet(this.value) ? this.value : "",
    };

    var template = null;
    var html = "";

    // fallbck
    if (this.template) {
      template = this.template;
    } else if (this.renderEl && this.renderEl.template) {
      template = this.renderEl.template;
    } else {
      console.log("rendering view's template", this);
      template = this.view.template;
    }
    var childrenhtml = "";
    _.each(this.children, function (child) {
      childrenhtml += child.generate();
    });
    data.children = childrenhtml;

    // Apply the HTML template
    html = _.template(template, {})(data);
    return html;
  };

  /*
   * Generates a HTML wallet render given the JSON object and renders
   * the credential
   *
   * Main entry point of the library. Defined as a jQuery function that typically
   * needs to be applied to a <div> element in the document.
   *
   * The function handles the following properties for the rendering object it
   * receives as parameter:
   *
   * - schema (optional): The JSON Schema that describes the credential to render.
   * set this to override the default schemas compliant with the decentralized identity foundation
   * spec.
   * - data (required) : The object data to be rendered
   * - validate: Validates the data along the schema. Uses the value
   * of the "validate" property as validator if it is an object.
   * - displayErrors: Function to call with errors upon submission.
   *  Default is to not render credential and to render error if exists.
   *
   * @function
   * @param {Object} options The Wallet Rendering object to use as basis for the render
   */
  $.fn.walletRender = function (options) {
    var domEl = $(this);
    options = _.defaults({}, options, {});
    var tree = new Tree();

    try {
      tree.initialize(options);
      console.log("rending over", domEl.get(0));
      tree.render(domEl.get(0));
      domEl.data("render-tree", tree);
      console.log("domEl", domEl);
      domEl.html = "hi2";
      console.log("domEl2", domEl);
      //      document.getElementById("schema-tree-tool").innerHTML =
      //       JSON.stringify(tree);
      // FIXME
      document.getElementById("message-id").innerHTML = ""; // reset the message
    } catch (error) {
      document.getElementById("message-id").innerHTML = error;
      console.log(error.stack);
    }
    return tree;
  };

  // Expose methods
  global.walletRender = global.walletRender || { util: {} };
})(
  typeof exports !== "undefined",
  typeof exports !== "undefined" ? exports : window,
  typeof jQuery !== "undefined" ? jQuery : { fn: {} },
  typeof _ !== "undefined" ? _ : null,
  JSON
);
