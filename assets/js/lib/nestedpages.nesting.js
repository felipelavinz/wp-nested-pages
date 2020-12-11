var NestedPages = NestedPages || {};

/**
* Enables and Saves Nesting
* @package Nested Pages
* @author Kyle Phillips - https://github.com/kylephillips/wp-nested-pages
*/
NestedPages.Nesting = function()
{
	var plugin = this;
	var $ = jQuery;

	plugin.formatter = new NestedPages.Formatter;

	// Make the Menu sortable
	plugin.initializeSortable = function()
	{
		
	}

	// Disable Nesting
	plugin.disableNesting = function()
	{
		
	}

	// Sync Nesting
	plugin.syncNesting = function(manual, callback)
	{
		var list,
		filtered;

		if ( nestedpages.manual_order_sync === '1' && !manual) return;
		$(NestedPages.selectors.errorDiv).hide();
		$(NestedPages.selectors.loadingIndicator).show();
		filtered = ( $(NestedPages.selectors.lists).first().hasClass('filtered') ) ? true : false;
		if ( NestedPages.jsData.nestable && !filtered ){
			// list = $(NestedPages.selectors.sortable).nestedSortable('toHierarchy', {startDepthCount: 0});
		} else {
			list = plugin.setNestingArray();
		}
		plugin.disableNesting();

		var syncmenu = NestedPages.jsData.syncmenu;
		if ( nestedpages.manual_menu_sync === '1' ) syncmenu = 'nosync';

		$.ajax({
			url: ajaxurl,
			type: 'post',
			datatype: 'json',
			data: {
				action : NestedPages.formActions.syncNesting,
				nonce : NestedPages.jsData.nonce,
				list : list,
				post_type : NestedPages.jsData.posttype,
				syncmenu : syncmenu,
				filtered : filtered
			},
			success: function(data, callback){
				plugin.initializeSortable();
				if (data.status === 'error'){
					$(NestedPages.selectors.errorDiv).text(data.message).show();
					$(NestedPages.selectors.loadingIndicator).hide();
				} else {
					if ( callback && typeof callback === 'function') {
						callback();
						return;
					}
					$(NestedPages.selectors.loadingIndicator).hide();
				}
			}
		});
	}

	plugin.setNestingArray = function(list)
	{
		ret = [];
		$(NestedPages.selectors.lists).first().children('li.page-row').each(function() {
			var level = plugin.recursiveNesting(this);
			ret.push(level);
		});
		return ret;
	}

	plugin.recursiveNesting = function(item) {
		var id = $(item).attr('id');
		var currentItem;
		if (id) {
			id = id.replace('menuItem_', '');
			currentItem = {
				"id": id
			};
			if ($(item).children(NestedPages.selectors.lists).children(NestedPages.selectors.rows).length > 0) {
				currentItem.children = [];
				$(item).children(NestedPages.selectors.lists).children(NestedPages.selectors.rows).each(function() {
					var level = plugin.recursiveNesting(this);
					currentItem.children.push(level);
				});
			}
			return currentItem;
		}
	}
}