collective.js.jQueryUIDialog
============================

Overlay replacement for Plone. Based on jQueryUI dialogs.

Installation
----------------------------

You can simply clone the repo into a directory in the src folder of your buildout.

    cd /path/to/your/instance/zeocluster/src
    git clone git://github.com/SteffenKockel/collective.js.jQueryUIDialog.git collective.js.jqueryuidialog

After that is done, add the extension under *buildout*, *zcml* and finally under *src* (see example syntax) to your `buildout.cfg`. 


Usage
----------------------------

To register a specific view, use a snippet like this in your JS file

    $.extend( $.fn._dialog_configs, {
			"view": { 
			tabs:false, 
			modal:true, 
		},		
			"edit": {
			tabs:false,
			modal:true,
			nextViewAfterNoForm: "view"
			},
		
		}

To enable the dialog function for a link, use the following code.

    $(".myLink").unbind().click(function(e) {
        $.fn.Dialog(this)
    });


To enable the dialog functionality for a link and a specific view configuration, use this method.

    $(".myEditLink").unbind().click(function(e) {
        $.fn.Dialog(this, "edit")
    });
    