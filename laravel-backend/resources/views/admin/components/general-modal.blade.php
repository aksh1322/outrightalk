<div class="modal-header">
	<h5 class="modal-title mt-0">{{ isset($module) ? $module : 'Information' }}</h5>
	<button type="button" data-dismiss="modal" aria-label="Close" class="close"><i class="fas fa-times"></i></button>
</div>
<div class="modal-body">
	<div class="row">
    	@include($includePage)
	</div>
</div>