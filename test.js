function aprilFools(){
	var style = 'a[rel^="lightbox"] img, #header{ filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=2); -webkit-transform: rotate(180deg); -moz-transform: rotate(180deg); -o-transform: rotate(180deg); transforom: rotate(180deg);}' +
		'a[rel^="lightbox"]{ position: relative; }'+
		'a[rel^="lightbox"]:before{ content: "April Fools!"; color: rgba(255,255,255,.5); display: block; width: 100%; height: 20px; position: absolute; top: 20px; text-align: center; font-size: 30px; z-index: 2000; text-shadow: 1px 1px 1px black; }';
	jQuery('body').append('<style>'+style+'</style>');
}
var today = new Date();
if((today.getMonth()+1) + '/' + today.getDate() == '4/1'){
	aprilFools();
}
