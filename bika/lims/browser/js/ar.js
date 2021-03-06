// ar.js and sample.js are nearly identical
(function( $ ) {

function workflow_transition_sample(event){
	event.preventDefault()
	if ($("#DateSampled").val() != "" && $("#Sampler").val() != "") {
		requestdata = new Object();
		requestdata.workflow_action = "sample";
		$.each($("form[name='header_form']").find("input,select"), function(i,v){
			name = $(v).attr('name');
			value =  $(v).attr('type') == 'checkbox' ? $(v).prop('checked') : $(v).val();
			requestdata[name] = value;
		});
		requeststring = $.param(requestdata);
		// sending only the username, because it's all we have access to.
		href = window.location.href.split("?")[0] + "?" + requeststring;
		window.location.href = href;
	} else {
		message = "";
		if ($("#DateSampled").val() == ""){
			message = message + PMF('${name} is required, please correct.', {'name':'Date Sampled'})
		}
		if ($("#Sampler").val() == ""){
			if(message != "") { message = message + "<br/>"; }
			message = message + PMF('${name} is required, please correct.', {'name':'Sampler'})
		}
		window.bika_utils.portalMessage(message);
	}
}

function save_header(event){
	event.preventDefault();
	requestdata = new Object();
	$.each($("form[name='header_form']").find("input,select"), function(i,v){
		name = $(v).attr('name');
		value =  $(v).attr('type') == 'checkbox' ? $(v).prop('checked') : $(v).val();
		requestdata[name] = value;
	});
	requeststring = $.param(requestdata);
	href = window.location.href.split("?")[0] + "?" + requeststring;
	window.location.href = href;
}

function workflow_transition_preserve(event){
	event.preventDefault()
	message = _("You must preserve individual Sample Partitions");
	window.bika_utils.portalMessage(message);
}

function workflow_transition_retract_ar(event) {
	event.preventDefault();
	$("body").append(
		"<div id='arretractmsgbox' style='display:none' title='" + _("AR retraction") + "'>"+
			"<p>" +
				_("If you retract/invalidate this Analysis Request, a new Analysis " +
				"Request will be created automatically with 'To be verified' " +
				"state and an email will be sent to the contacts who ordered " +
				"the results.") +
			"</p>" +
			"<p>&nbsp;</p><p>" +
				_("Use the following box for additional remarks:") +
			"<br/></p>" +
			"<textarea rows='3' cols='35' " +
			"	id='arretractmsgbox_addremarks' " +
			"	name='arretractmsgbox_addremarks'></textarea>" +
			"<p>&nbsp;</p><p>" +
				_("Are you sure?") +
			"</p>" +
		"</div>");

	yes = _("Yes");
	no = _("No");
	$("#arretractmsgbox").dialog({width:450, resizable:false, closeOnEscape: false,
		buttons:{
			yes: function(){
				// Set the additional remarks to the AR
				href = $("#workflow-transition-retract_ar").attr("href");
				addremarks = $.trim($("#arretractmsgbox_addremarks").val());
				if (addremarks && addremarks!='') {
					$("#archetypes-fieldname-Remarks #Remarks").val(addremarks);
					$("#archetypes-fieldname-Remarks input[type='submit']").click();
					// Add a delay in order to allow server saving the remarks
					// Not sure if needed. Works without this snippet in dev
					setTimeout(function (){
						href += "&addremarks=1";
						window.location.href = href;
			         }, 2000);
				} else {
					$(this).dialog("close");
					window.location.href = href;
				}
			},
			no:function(){
				$(this).dialog("close");
			}
		},
		close:function(){
			$('#portal-columns').fadeTo('slow', 1);
		}
	});
	$('#portal-columns').fadeTo('slow', 0.3);
}

function populate_sampletype(title) {
	$.ajax({
		url: window.portal_url + "/getsampletypeinfo",
		type: 'POST',
		data: {'_authenticator': $('input[name="_authenticator"]').val(),
               'Title': title},
	    dataType: "json",
	    success: function(data, textStatus, $XHR){
	    	$('#SampleMatrix').val(data['SampleMatrixTitle']);
	    }
	});
}

$(document).ready(function(){

	_ = jarn.i18n.MessageFactory('bika');
	PMF = jarn.i18n.MessageFactory('plone');

	// Plone "Sample" transition is only available when Sampler and DateSampled
	// are completed
	$("#workflow-transition-sample").click(workflow_transition_sample);

	// Trap the save button
	$("input[name='save']").click(save_header);

	// Disable Plone UI for preserve transition
	$("#workflow-transition-preserve").click(workflow_transition_preserve);

	// Show email message box when AR gets retracted/invalidated
	$("#workflow-transition-retract_ar").click(workflow_transition_retract_ar);

	// Update sample matrix when sample type changed in AnalysisRequestViewView
	// Must be only loaded in AnalysisRequestViewView:
	//  /clients/<client_id>/<ar_id>
	//  /clients/<client_id>/<ar_id>/base_view
	if (window.location.href.search('/clients/') >= 0) {
		clientid =  window.location.href.split('/clients/')[1].split('/')[0];
		arid = $(".documentFirstHeading").html();
		if (arid && window.location.href.search('/clients/'+clientid+'/'+arid)) {
			$("#SampleType").autocomplete({
		        select: function (event, ui) {
		        	populate_sampletype(ui.item.value);
		        }
		    });
			if ($("input[id='SampleMatrix']")) {
				$("input[id='SampleMatrix']").attr('readonly', true);
			}
		}
	}

});
}(jQuery));
