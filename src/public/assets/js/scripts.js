(function (window, undefined) {
	"use strict";
	/*
    NOTE:
    ------
    PLACE HERE YOUR OWN JAVASCRIPT CODE IF NEEDED
    WE WILL RELEASE FUTURE UPDATES SO IN ORDER TO NOT OVERWRITE YOUR JAVASCRIPT CODE PLEASE CONSIDER WRITING YOUR SCRIPT HERE.  */
	if ($("#activeSideBar").length) {
		$("#" + $("#activeSideBar").val()).addClass("active");
	}
	if ($("#siteToast").length) {
		// On load Toast
		setTimeout(function () {
			toastr[$("#siteToast").attr("data-type")](
				$("#siteToast").attr("data-title"),
				$("#siteToast").attr("data-info"),
				{
					closeButton: true,
					tapToDismiss: false,
					rtl: $("html").attr("data-textdirection") === "rtl",
				}
			);
		}, 200);
	}
	//loader on submit
	$("form").submit(function (e) {
		if ($(this).valid()) {
			blockUI();
		} else {
			e.preventDefault();
		}
	});

	if ($(".confirm-delete").length) {
		$(".confirm-delete").click(() => {
			return confirm("Are you sure ?");
		});
	}
	$(document).ajaxStart(function (e) {
		blockUI();
	});
	$(document).ajaxStop(function (e) {
		setTimeout($.unblockUI, 100);
	});
	$(window).on("load", function () {
		if (feather) {
			feather.replace({
				width: 14,
				height: 14,
			}); 
		}
		if ($(".date-picker").length) {
			$(".date-picker").flatpickr();
		}
	});
})(window);

function blockUI() {
	$.blockUI({
		css: {
			backgroundColor: "transparent",
			border: "none",
		},
		message: '<div class="loader">Loading...</div>',
		baseZ: 1500,
		overlayCSS: {
			backgroundColor: "#FFFFFF",
			opacity: 0.7,
			cursor: "wait",
		},
	});
}
function ajaxCall(url, method, args, binary = false) {
	let res;
	if (binary) {
		res = $.ajax({
			url: url,
			type: method,
			data: args,
			success: function (data) {},
			async: false,
			processData: false,
			contentType: false,
			error: function (err) {
				console.log("err ajaxCall ==>", err);
			},
		}).responseText;
	} else {
		res = $.ajax({
			url: url,
			type: method,
			data: args,
			success: function (data) {},
			async: false,
			error: function (err) {
				console.log("err ajaxCall ==>", err);
			},
		}).responseText;
	}
	return res;
}

function setIdForReply(id) {
	$("#queryId").val(id);
	$("#form_test").attr("action", "/admin/queries/edit/" + id);
	// console.log($("#form_test").value);
}

//uploading 
if ($('.file-upload').length) {
	$('.file-upload').change(async function () {
		let folder = $(this).attr('folder-name')
		let file = this.files[0].name
		if(folder && file){
			//makeToast('File uploaded started','info')
			
			$('input[type=submit]').attr('disabled', true)
			let fileName = $(this).attr('file-name');
			let fileExists = $("#"+fileName+"FileExists").val();
			if(fileExists=="default.png" || fileExists=="undefined" || fileExists==undefined) {
				fileExists = "";
			}
			
			let formdata = new FormData();

			formdata.append("folder",folder)
			formdata.append("fileExists",fileExists)
			formdata.append("file",this.files[0])
			$("#"+fileName+"Img").attr("src","/app-assets/images/loader.gif");

			let ajaxResp = await ajaxCall('/ajax/upload','POST',formdata,true)
			ajaxResp = JSON.parse(ajaxResp)
			console.log('ajax response', ajaxResp)
			if(ajaxResp.message == "Success" || ajaxResp.status==true){
				loadSignedImage(folder, fileName, ajaxResp.data.fileName);
			} else {
				makeToast(ajaxResp.data,'danger')
			}

		} else {
			// makeToast('Unable to upload, please try again later.','danger')
		}
	});
}


function loadSignedImage(folder, fileName, filePath){
	console.log('this is file name', fileName);
	console.log('this is filepath', filePath);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/ajax/presigned-url?fileName=${filePath}`);
    xhr.onreadystatechange = () => {
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                const response = JSON.parse(xhr.responseText);
				console.log("this is response", response);

				$("#"+fileName+"Img").attr("src", response.data.url);
				$("#"+fileName).attr("value", filePath)
            } else{
                alert('Could not get signed URL.');
            }
        }
    };
    xhr.send();
}

function deleteObject(fileName, id, model, subModel) {
		if(confirm("Are you sure ?")) {
			const xhr = new XMLHttpRequest();
			console.log('this is filenae', fileName	)
			xhr.open("GET", `/ajax/delete-object/?fileName=${fileName}&id=${id}&model=${model}`);
			xhr.onreadystatechange = () => {
				if(xhr.readyState === 4){
					if(xhr.status === 200){
					 window.location.reload();
					} else{
						// alert('Could not delete image.');
						 window.location.reload();
					}
				}
			};
			xhr.send();
		}
		
}
