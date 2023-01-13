/*
 * Wallet rendering library
 *
 * Implementation of https://identity.foundation/wallet-rendering/
 *
 * To use:
 *
 * 1. add this library to your application
 * 2. invoke the walletRender global function. i.e
 * document.getElementById("viz").walletRender({
 *   data: dataobj,
 * })
 *
 * Heavily inspired by: https://github.com/jsonform/jsonform/blob/master/lib/jsonform.js
 */

var wr = { util: {} };

/**
 * Returns true if given value is neither "undefined" nor null
 */
var isSet = function (value) {
  return !(_.isUndefined(value) || _.isNull(value));
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

renderTree.prototype.initialize = function () {
  // Create the root of the tree
  this.root = new targetNode();
  this.root.ownerTree = this;
  this.root.view = wr.elementTypes["root"];

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
 * @param {boolean} noErrorDisplay whether to display errors
 */
renderTree.prototype.validate = function (noErrorDisplay) {};

/* TODO
 * constructs the tree from the JSON
 *
 *  The function must be called once when the tree is first created.
 *
 * @function
 */
renderTree.prototype.buildTree = function () {};

/*
 * TODO
 * Builds the internal wr tree representation from the requested layout.
 *
 * The function is recursive, generating the node children as necessary.
 * The function extracts the values from the previously submitted values
 * (this.formDesc.value) or from default values defined in the schema.
 *
 * @function
 * @param {Object} element The element to render
 * @param {Object} context The parsing context (the array depth in particular)
 * @return {Object} The node that matches the element.
 */
renderTree.prototype.buildFromLayout = function () {};
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

/*
 * Updates the DOM element associated with the node
 *
 * Only nodes that have ID are directly associated with a DOM element.
 *
 * @function
 */
targetNode.prototype.updateElement = function () {
  if (this.id) {
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
targetNode.prototype.setContent = function () {
  var node = $(html);
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
  this.updateElement(this.el);
};

/*
 * Generates view's HTML content for the model
 *
 * @function
 */
targetNode.prototype.generate = function () {};

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
$.n.walletRender = function (options) {
  var el = $(this);
  options = _.defaults({}, options, {});
  var wr = new renderTree();
  wr.initialize();
  wr.render(el.get(0));
  return wr;
};

// Expose methods
global.WalletRender = global.WalletRender || { util: {} };
