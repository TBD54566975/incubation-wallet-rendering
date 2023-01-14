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

  const defaultElementPrefix = "walletrender";
  const rootName = "root";

  var render = { util: {} };

  render.elementTypes = {
    root: {
      template: "<div><%= children %></div>",
    },
    image: {
      template: "<div>" + '<img src="<%=node.src %>" id="<%= id %>"/>',
    },
    text: {},
  };

  /**
   * Returns true if given value is neither "undefined" nor null
   */
  var isSet = function (value) {
    return !(_.isUndefined(value) || _.isNull(value));
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
  var renderTree = function () {
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
  renderTree.prototype.render = function (domRoot) {
    if (!domRoot) return;
    this.domRoot = domRoot;
    this.root.render();
  };

  renderTree.prototype.initialize = function (description) {
    description = description || {};
    this.description = _.clone(description);

    // Compute element prefix if no prefix is given.
    this.description.prefix =
      this.description.prefix || defaultElementPrefix + _.uniqueId();

    this.description.params = this.description.params || {};

    // Create the root of the tree
    this.root = new targetNode();
    this.root.ownerTree = this;
    this.root.view = render.elementTypes[rootName];

    // Generate the tree from the descriptors
    this.buildTree();
  };

  /**
   * Walks down the element tree with a callback
   *
   * @function
   * @param {Function} callback The callback to call on each element
   */
  renderTree.prototype.forEachElement = function (callback) {
    var f = function (root) {
      for (var i = 0; i < root.children.length; i++) {
        callback(root.children[i]);
        f(root.children[i]);
      }
    };
    f(this.root);
  };

  /*
   * TODO @andorsk:
   * @param {boolean} noErrorDisplay whether to display errors
   */
  renderTree.prototype.validate = function (noErrorDisplay) {};

  /* TODO
   * constructs the tree from the JSON
   *
   * The function must be called once when the tree is first created.
   *
   * @function
   */
  renderTree.prototype.buildTree = function () {
    console.log("building tree", this.description);
    // Parse and generate the form structure based on the elements encountered:
    // - '*' means "generate all possible fields using default layout"
    // - a key reference to target a specific data element
    // - a more complex object to generate specific form sections
    _.each(
      this.description.data,
      function (wrEl) {
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
            wrel = {
              key: wrEl,
            };
          }
          console.log(wrEl);
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
  renderTree.prototype.buildFromLayout = function (el, context) {
    var schemaElement = null;
    var node = new targetNode();
    var view = null;
    var key = null;

    // The element parameter directly comes from the initial
    // object. We'll make a shallow copy of it and of its children
    // not to pollute the original object.
    // (note JSON.parse(JSON.stringify()) cannot be used since there may be
    // event handlers in there!)
    el = _.clone(el);

    console.log("EL", el);
    console.log("building layout");
  };
  /*
   * Represents a node in the data model
   *
   * Nodes that have an ID are linked to the corresponding DOM element
   * when rendered
   *
   */
  var targetNode = function () {
    this.id = null; // nodes id
    this.key = null; // key path
    this.el = null; // DOM element associated with node. Set on render
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
   * @param {targetNode} node The child node to append
   * @return {targetNode} The inserted node (same as the one given as parameter)
   */
  targetNode.prototype.appendChild = function (node) {
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
  targetNode.prototype.removeChild = function () {
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
  targetNode.prototype.render = function (el) {
    var html = this.generate();
    this.setContent(html, el);
    this.enhance();
  };

  targetNode.prototype.enhance = function () {
    var node = this;
  };

  /**
   * Clones a node
   *
   * @function
   * @param {targetNode} New parent node to attach the node to
   * @return {targetNode} Cloned node
   */
  targetNode.prototype.clone = function (parentNode) {
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
  targetNode.prototype.updateElement = function (domNode) {
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
  targetNode.prototype.setContent = function (html, parentEl) {
    var node = $(html);

    var parentNode =
      parentEl ||
      (this.parentNode ? this.parentNode.el : this.ownerTree.domRoot);
    var nextSibling = null;

    let tJ = JSON.stringify(targetNode);
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
    console.log("replacing ", this.el);
    this.updateElement(this.el);
  };

  /*
   * Generates view's HTML content for the model
   *
   * @function
   */
  targetNode.prototype.generate = function () {
    var data = {
      id: this.id,
      el: this.el,
      node: this,
    };

    var template = null;
    var html = "";
  };

  /*
   * Generates a HTML wallet render given the JSON object and renders
   * the credential
   *
   * Main entry point of the library. Defined as a jQuery function that typically
   * needs to be applied to a <div> element in the document.
   *
   * The function handles the following properties for the JSON Form object it
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
    var el = $(this);
    options = _.defaults({}, options, {});
    var wr = new renderTree();
    wr.initialize(options);
    console.log(wr);
    wr.render(el.get(0));
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
