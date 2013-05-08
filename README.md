collective.js.jQueryUIDialog
============================

Overlay replacement for Plone. Based on jQueryUI dialogs.

To register a specific view, use a snippet like this in your JS file

`$.extend( $.fn._dialog_configs, {  
			"view": {  
			tabs:false,  
			modal:true,   
		},`

To enable the dialog function for a link, use the following code.

`$(".myLink").unbind().click(function(e) {  
    $.fn.Dialog()  
});`  

