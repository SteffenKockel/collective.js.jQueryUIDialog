/**
 * @author Steffen Kockel
 * @date May2013
 */

if(jQuery) (function($) {
	
	$.extend($.fn, {
		
				
    	_open_dialogs: new Array(),
    	
    	_dialog_configs: {},
    		
		_Dialog2_cfg: {
			 	// jQuery UI Dialog
			 	modal: false,
			 	closeOnEscape: true,
			 	dialogClass: "rahmenbuch-dialog-window",
			 	draggable: true,
			 	resizable: false,
			 	width: 600,
			 	create: false, // default callback
			 	close: undefined,
			 	drag: false,
			 	dragStart: false,
			 	dragStop: false,
			 	position:"top",
			 	// custom dialog properties
			 	IdFromTimestamp:false,
			 	IdPlusTimestamp:false,
			 	ajaxLoad: false,
			 	noForm: false,
			 	noFormAction:"follow",
			 	successCallback: undefined,
			 	cancelCallback: undefined,
			 	closeCallback: undefined,
			 	noFormCallback: undefined,
			 	nextViewAfterNoForm: "view",
			 	// get the normal next_url, filter the portal message, redirect to
			 	// the force view and insert the portal message. (not implemented yet)
			 	forceNextViewAfterNoForm: false, 			 	 
			 	nextViewAfterCancel: "view",
			 	menu: true,
			 	preserveMenu: false, 			// keep the menu from the last view 
			 	tabs: true,
			 	wysiwyg: true, 					// load tinyMCE editor
			 	calendar: true,
			 	saveButton: 'save',
			 	//saveFormName: false,
			 	cancelButton: 'cancel',
		},
		
		block_dialog: function(s) {
			// add loading animation				
			$("div#"+s).animate({opacity:0});
			$("div#"+s).wrap('<span class="loading" id="loading-'+s+'" />');
			//$('span#loading-'+s).addClass("loading");
			return true;
		},
		
		unblock_dialog: function(s) {
			// remove loading animation				
			$("div#"+s).animate({opacity:1});
			$("div#"+s).unwrap();
			//$('span#loading-'+s).removeClass("loading");
			return true;
		},
		
		
		Dialog: function(ctx,view,s) {
			/* get base configuration
			 * 
			 * ctx = context   (mostly a link )
			 * view = viewname (e.g.: "view" )
			 * c = config	   (the dialog config for this view)	 
			 * s = selector    (css is of the dialog )
			 * 
			 */
			var c = $.extend({}, $.fn._Dialog2_cfg);
			var url = ctx.href;
			
			/* Get the view name from the last part of the url
			 * if not explicitly specified by dialog call. 
			 */
			if (!view) {view = ctx.href.split("/").slice(-1)[0]}
			
			// allow multiple add forms
			if (!s) {
				if (c["IdFromTimestamp"]==true) { 
					s = (new Date).getTime() 
				} else {
    				// get selector (id)
					if (ctx.id) {
						s = 'dialog-'+ctx.id 
						if (c["IdPlusTimestamp"]==true)
							s = s+"-"+(new Date).getTime()
					} else {
						// This is weird and costly. Sometimes it fails to work.
						// make shure, you work with ids on links 
						s = 'dialog-'+ctx.href.split("/").slice(-2)[0] 
					}
				}
			}
			
			// update config, if necessary
			if ($.fn._dialog_configs[view]) { $.extend(c, $.fn._dialog_configs[view]) }
			
    		/*
			 * 
			 *  Dialog functions 
			 * 
			 */
			
			function block() {				
				$.fn.block_dialog(s)
				return true;
			};
			
			function unblock(){
				$.fn.unblock_dialog(s)
			};
			
			function save_button(view, s, c) {
				//console.log(view, s, c);
				$('#'+s+' [name="form.buttons.'+c["saveButton"]+'"]').unbind().bind("click", function(e){
					e.preventDefault();
					var $form = $('#'+s+' form');
					form = $form.serialize();
					form += "&form.buttons."+c["saveButton"];
					// reload save result
					load($form.attr("action")+"?"+form, view, s, c);
					});
			};
			
			function cancel_button(s) {
				$('#'+s+' [name="form.buttons.'+c["cancelButton"]+'"]').unbind().bind("click", function(e) {
				e.preventDefault();
				D.dialog("close");
				});
			};

			function load(url,view,s,c) {
				block();
				/* Debug 
				console.log("context:",url);
				console.log("view:",view);
				console.log("selector", s);
				console.log("config", c);
				*/
				
				// ajax (w/o menu!)
				if (c['ajaxLoad']==true) { url = url+"?ajax_load="+(new Date()).getTime() }
				
				// non ajax
				$.ajax({
					url: url,
					method: 'GET',
					cache: false,
					success: function(d) {
						var dom = $(d);
						
						// is this a noform situation
						if (c["noForm"]!=false) {
							// check for the form
							var f = dom.find(c["noForm"]);
							// if no Form
							if ($(f).length==0) {
								// execute noFormCallback
								if (c["noFormCallback"]){ c["noFormCallback"](s,d) }
								
								// close action
								if (c["noFormAction"]=="close") {
									// close the dialog 
									D.dialog("close");
									// get the portal Message and display it in main window
									var msg = dom.find("#portal_messages_container");
									$('#portal_messages_container').append($(msg).html());
									$.fn.delay( function() { 
										$('#portal_messages_container dl.portalMessage').fadeOut() }, 3000
									);
									return true;
								}
								
								// follow action
								if (c["noFormAction"]=="follow") {
									// get the new viewname
									view = c["nextViewAfterNoForm"];
									// get the new config
								    c = $.fn._Dialog2_cfg;
									if ($.fn._dialog_configs[view]) { 
										$.extend(c, $.fn._dialog_configs[view]); 
									}
									/* Debug */ 
									console.log("context:",url); console.log("view:",view); console.log("selector", s); console.log("config", c);																	
								} 
							}														
						}
						
						
						
						if (c["menu"]==true && c["preserveMenu"]==false) {		
							var $ac = dom.find('div#edit-bar');
							// properly formatted action menus
							var dac = $ac.find('#plone-contentmenu-actions ul');
							// content tabs (actions)
							var cac = $ac.find('#content-views').remove();					
								
								if (dac.length==0) {
								// if no actions are allowed, we need to generate some boilerplate
								// template to satisfy the dropdown magic. Not beautiful, but rare.
								dac =  '<li><dl class="actionMenu deactivated" id="'+s+'plone-contentmenu-actions">';
								dac += '<dt class="actionMenuHeader label-"><a title=Aktionen href="#">';
								dac +='<span>Aktionen</span><span class="arrowDownAlternative"> ▼ ';
								dac += '</span></a></dt><dd class="actionMenuContent"><ul>';
								dac += $(cac).html()+'</ul></dd></dl></li>';
								
								if ($ac.find("#contentActionMenus").html()) {
									$ac.find("#contentActionMenus").append(dac);	
								} else {
									$ac.find(".contentActions").append('<ul id="contentActionMenus">'+dac+'</ul>')
								}
							} else {
								$(dac).prepend($(cac).children());	
								}
							
							// add unique ids to dropdown menus 
							$(['actions','workflow','factories','display']).each( function(k,v) {
								$ac.find('#plone-contentmenu-'+v).attr("id", s+"-plone-contentmenu-"+v);
							});
							
							$('span#ui-dialog-title-'+s).empty().append($ac);
							
							// if we have actions (mostly we do), prepare the links to act 
							// properly.
							if ($ac.html()!=undefined) {
								//console.log("has menu");
								$("#ui-dialog-title-"+s+" a").each( function(i,a) {
									$(a).unbind().bind("click", function(e) {
										e.preventDefault();
										var v = this.href.split("/").slice(-1)[0];
										// if we have no custom configuration for this view,
										// we take a fallback
										if (!$.fn._dialog_configs[v]) { v = "view" }
										var cc = $.fn._Dialog2_cfg;
										var vc = $.fn._dialog_configs[v];
										if (vc) { $.extend(cc ,vc) } 									 
										load(this.href,v,s,cc);
									});
								});
								$.getScript("dropdown.js");
							}
						} else {
						
						if (c["menu"]==false && ["preserveMenu"]==false) {
							// no menu - we take the title and put it into the dialog title
							$('span#ui-dialog-title-'+s).empty().append(
								dom.find('.documentFirstHeading').remove()
								);
							}
									
						
						}
						
						// replace content
						if (c['ajaxLoad']==true) { 
							$("#"+s).empty().append(d); 
						} else {
							$("#"+s).html(dom.find('#content'));
							/* 
							 * The following magic is proudly stolen from
							 * 
							 * http://stackoverflow.com/questions/2699320/
							 * jquery-script-tags-in-the-html-are-parsed-out-by-jquery-and-not-executed
							 * 
							 * and makes shure that scripts in the body of the
							 * requested content are getting executed. This is
							 * important for the calendar and some other widgets
							 * that use JS for input preparation.
							 */
							dom.filter('script').each( function() { 
								$.globalEval(this.text || this.textContent || this.innerHTML || ''); 
							});
						}
						
						// enable tabs
						if (c["tabs"]==true) { D.ploneTabInit() }
						
						// enable calendar
						//if (c["calendar"]=!false){ $.fn.dialog_calendar(s) }
						
						if (c["wysiwyg"]==true) {
							/*$.getScript("portal_javascripts/Fahrradstation%20Basis%20Theme/tiny_mce.js");
							$.getScript("portal_javascripts/Fahrradstation%20Basis%20Theme/tiny_mce_init.js");
							$.getScript("portal_javascripts/Fahrradstation%20Basis%20Theme/langs/de.js");
							$.getScript("portal_javascripts/Fahrradstation%20Basis%20Theme/themes/advanced/editor_template.js")*/
							//$('textarea.mce_editable').each(function() {
								
								//var config = new TinyMCEConfig($(this).attr('id'));
								//config.init();
    						//});
						}
						


						
						// enable buttons
						save_button(view, s, c);
						cancel_button(s);
						
						// success callback (onLoad)
						if (c['successCallback']) { c['successCallback'](s,d) };
						unblock();
					}
				}); 
			};
			
			// check, if window with this selector is already open
			if ($.fn._open_dialogs.indexOf(s)!=-1) {
				// this window is already open
				$('#'+s).dialog("moveToTop").parent().effect("highlight");
				return true;
				}
			// "register" dialog window
			$.fn._open_dialogs.push(s);
			
			
			// HTML Dialog wrapper
			var D = $('<div id="'+s+'"></div>');
			// register close selector
			$.extend(c, {
				close: function(e,u) { 
					$.fn._open_dialogs.splice( $.fn._open_dialogs.indexOf(s));
					if (c["closeCallback"]){ c["closeCallback"](s) }
					D.remove();
				}
			});
			 			
			D.append('<span id="loading-'+s+'" class="loading">');
			D.dialog(c);
			load(url, view, s, c);
			
		},
	});
	
})(jQuery);