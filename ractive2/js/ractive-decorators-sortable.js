(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	global.Ractive.decorators.sortable = factory()
}(this, function () { 'use strict';

	var ractive, sourceKeypath, sourceArray, sourceIndex, dragstartHandler, dragenterHandler, removeTargetClass, preventDefault, info;

	var ractive_decorators_sortable__sortable = function sortable(node) {
		node.draggable = true;

		node.addEventListener('dragstart', dragstartHandler, false);
		node.addEventListener('dragenter', dragenterHandler, false);
		node.addEventListener('dragleave', removeTargetClass, false);
		node.addEventListener('drop', removeTargetClass, false);

		// necessary to prevent animation where ghost element returns
		// to its (old) home
		node.addEventListener('dragover', preventDefault, false);

		return {
			teardown: function teardown() {
				node.removeEventListener('dragstart', dragstartHandler, false);
				node.removeEventListener('dragenter', dragenterHandler, false);
				node.removeEventListener('dragleave', removeTargetClass, false);
				node.removeEventListener('drop', removeTargetClass, false);
				node.removeEventListener('dragover', preventDefault, false);
			}
		};
	};

	ractive_decorators_sortable__sortable.targetClass = 'droptarget';

	var errorMessage = 'The sortable decorator only works with elements that correspond to array members';

	dragstartHandler = function (event) {
		var storage = this._ractive,
		    lastDotIndex;
		info = Ractive.getNodeInfo(this);

		sourceKeypath = info.resolve();

		// this decorator only works with array members!
		lastDotIndex = sourceKeypath.lastIndexOf('.');

		if (lastDotIndex === -1) {
			throw new Error(errorMessage);
		}

		sourceArray = sourceKeypath.substr(0, lastDotIndex);
		sourceIndex = +sourceKeypath.substring(lastDotIndex + 1);
		info.ractive.set('sourceIndex', sourceIndex);

		if (isNaN(sourceIndex)) {
			throw new Error(errorMessage);
		}

		event.dataTransfer.setData('foo', true); // enables dragging in FF. go figure

		// keep a reference to the Ractive instance that 'owns' this data and this element
		ractive = info.root;
	};

	dragenterHandler = function () {
		var targetKeypath, lastDotIndex, targetArray, targetIndex, array, source;

		// If we strayed into someone else's territory, abort
		if (Ractive.getNodeInfo(this).root !== ractive) {
			console.log('dragenterHandler() abort', 'root');
			return;
		}

		targetKeypath = Ractive.getNodeInfo(this).resolve();

		// this decorator only works with array members!
		lastDotIndex = targetKeypath.lastIndexOf('.');

		if (lastDotIndex === -1) {
			throw new Error(errorMessage);
		}

		targetArray = targetKeypath.substr(0, lastDotIndex);
		targetIndex = +targetKeypath.substring(lastDotIndex + 1);

		// if we're dealing with a different array, abort
		if (targetArray !== sourceArray) {
			console.log('dragenterHandler() abort', 'array');
			return;
		}

		// if it's the same index, add droptarget class then abort
		sourceIndex = info.ractive.get('sourceIndex');
		console.log('dragenterHandler() abort', 'index', targetIndex, sourceIndex);
		if (targetIndex === sourceIndex) {
			this.classList.add(ractive_decorators_sortable__sortable.targetClass);
			return;
		}

		array = info.ractive.get(sourceArray);

		// remove source from array
		source = array.splice(sourceIndex, 1)[0];

		// the target index is now the source index...
		sourceIndex = targetIndex;

		// add source back to array in new location
		array.splice(sourceIndex, 0, source);
		info.ractive.set(sourceArray, array);
	};

	removeTargetClass = function () {
		this.classList.remove(ractive_decorators_sortable__sortable.targetClass);
	};

	preventDefault = function (event) {
		event.preventDefault();
	};

	var ractive_decorators_sortable = ractive_decorators_sortable__sortable;

	return ractive_decorators_sortable;

}));
