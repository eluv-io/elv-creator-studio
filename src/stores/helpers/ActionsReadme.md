## Action Handling

Actions represent modifications made to an object. Actions have the following properties:

### `id`
A unique ID to represent the action

### `type`
The type of action

### `objectId`
The object ID to which the object applies

### `page`
The page this field is present on. This is necessary to restrict undo/redo actions to only fields present in the currently visible form. 

### `key`
A key identifying the specific field being modified (usually a metadata path)

### `Apply`
A function that, when called, will perform the modification on local state

### `Undo`
A function that, when called, will undo the modification on local state

### `Write`
A function that, when called, will write the modification in the fabric

### `category`
A broad category describing the action

### `subcategory`
A more specific category describing the action

### `description`
A specific description of the action


### Stackable
Stackable actions are those that can be collapsed with adjacent actions of the same type operating on the same field. 

For example, when modifying a text field, actions may be applied character by character, so you might end up with a list of actions modifying the `name` field that looks like `S, St, Ste, Stev, Steve`.

A stackable field will replace each adjacent modification with only the latest, resulting in only one action for the above sequence. 

Stacking is applied immediately, and is used to facilitate the undo/redo functionality
