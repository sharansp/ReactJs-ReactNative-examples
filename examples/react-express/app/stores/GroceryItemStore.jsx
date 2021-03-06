'use strict'
var dispatcher = require('./../dispatcher.js');
var RestHelper = require('./../helpers/RestHelper.js');



function GroceryItemStore(){
	
	var listeners = [];
	var items = JSON.parse(localStorage.getItem('items')) || [];

	RestHelper.get('api/items')
	.then(function (data) {
		items = data;
		triggerListeners();
	});


	function getItems(){
		return items;
	}

	function addGroceryItem(item){
		items.push(item);
		triggerListeners();
		RestHelper.post('api/items', item);
		// to validate add .then() and check the response
	}

	function deleteGroceryItem(item){
		
		var index;
		items.filter(function(_item, _index){
			if(_item.name == item.name){
				index = _index;
			}
		});

		items.splice(index, 1);
		triggerListeners();
        
        RestHelper.del('api/items/'+item._id);

	}

	function buyGroceryItem (item, buy) {
		var index;
		items.filter(function(_item, _index){
			if(_item.name == item.name){
				index = _index;
			}
		});

		items[index].purchased = buy || false;
		triggerListeners();
        
        RestHelper.patch('api/items/'+item._id, item);

	}

	function onChange(listener){
		listeners.push(listener);
	}

	function triggerListeners(){
        localStorage.setItem('items', JSON.stringify(items));
		listeners.forEach(function(listener){
			listener(items);
		});
	}

	dispatcher.register(function(event){
		var split = event.type.split(':');
		if(split[0] === 'grocery-item'){
			switch(split[1]){
				case 'add':
					addGroceryItem(event.payload);
					break;
				case 'delete':
					deleteGroceryItem(event.payload);
					break;
				case 'buy':
					buyGroceryItem(event.payload, true);
					break;
				case 'unbuy':
					buyGroceryItem(event.payload, false);
					break;
			}
		}
	});

	return {
		getItems: getItems,
		onChange: onChange
	}
}

module.exports = new GroceryItemStore();