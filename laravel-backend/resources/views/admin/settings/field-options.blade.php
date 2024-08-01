<div class="row">
    <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12 form-control-label">
    	<label for="setting-option-key" class="form-label">Field Options</label>
    </div>
    <div class="col-lg-9 col-md-9 col-sm-6 col-xs-12 m-b-10">
    	<div class="row">
		    <div class="col-lg-4 col-md-4 col-xs-12 col-sm-6 m-b-10">
		        <div class="form-group m-b-10">
		            <div class="form-line">
		                <input id="setting-option-key" class="form-control" type="text" placeholder="Option Key">
		            </div>
		        </div>
		    </div>
		    <div class="col-lg-4 col-md-4 col-xs-12 col-sm-6 m-b-10">
		        <div class="form-group m-b-10">
		            <div class="form-line">
		                <input id="setting-option-val" class="form-control" type="text" placeholder="Option Value">
		            </div>
		        </div>
		    </div>
		    <div class="col-lg-1 col-md-1 col-xs-12 col-sm-6 text-left m-b-10">
		    	<button class="btn btn-info waves-effect btn-sm" type="button" id="setting-option-add"><i class="material-icons">add</i> <span>Add Option</span></button>
		    </div>
    	</div>
    	<div class="row">
    		<div class="col-lg-8 col-md-8 col-xs-12 col-sm-12 m-b-10">
    			<div class="form-group m-b-0">
		            <div class="form-line">
    					<textarea id="setting-options" name="field_options" class="form-control">{{ $data->field_options ? json_encode($data->field_options) : '' }}</textarea>
    				</div>
    			</div>
    		</div>
    	</div>
	</div>
</div>