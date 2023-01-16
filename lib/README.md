# Wallet Rendering Library

# Wallet Rendering.js File

In the wrender.js file, you bind a DOM element to the Render object. The
following process then takes place.

1. The JSON is parse, and converted into a Tree
2. Each node in the tree generates an HTML element
3. These are then bound to event handlers if necessary
4. The DOM is then updated

Here's a class diagram for review.

![](https://i.imgur.com/zZvcKDj.png)

```mermaid
classDiagram

    class JSRuntime{
        +RegisterToGlobalNamespace
    }


    class WalletRender {
        + render()
        + templates(inner)
        + elementTypes
    }

    note for WalletRender "main entry point bound to a DOM object"

    class Tree {
        - eventhandlers
        - root
        - description
        - initialize()
        - buildTree()
        - buildFromLayout()
        - computeInitialValues()
        - render(this, root)
        - forEach(this, callback)
        - validate()
    }

    note for Tree "generates a tree from the JSON Object"

    class Node {
        + id
        + key
        + el
        + wrEl
        + view
        + schemaEl
        + children
        + ownerTree
        + parentNode
        + childTemplate
        + childPos
        + clone()
        - generate()
        - setContent(this, html, el)
        - enhance()
    }

    note for Node "renders a node in the tree and has the main render"

    JSRuntime "1" .. "n" WalletRender
    WalletRender "1" .. "1" Tree
    Tree "1" .. "n" Node

```
