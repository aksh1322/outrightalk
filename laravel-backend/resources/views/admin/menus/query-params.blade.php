<div class="row">
<div class="col-lg-3 col-md-3 col-sm-6 col-xs-12 text-right">
        <label for="description" class="col-form-label">Query Parameters</label>
</div>
    <div class="col-lg-9 col-md-9 col-sm-6 col-xs-12 m-b-10">
    	<div class="row">
		    <div class="col-lg-4 col-md-4 col-xs-12 col-sm-6 m-b-10">
		        <div class="form-group m-b-10">
		            <div class="form-line">
		                <input id="query-param-key" class="form-control" type="text" placeholder="Option Key">
		            </div>
		        </div>
		    </div>
		    <div class="col-lg-4 col-md-4 col-xs-12 col-sm-6 m-b-10">
		        <div class="form-group m-b-10">
		            <div class="form-line">
		                <input id="query-param-val" class="form-control" type="text" placeholder="Option Value">
		            </div>
		        </div>
		    </div>
		    <div class="col-lg-2 col-md-2 col-xs-12 col-sm-6 text-left m-b-10">
		    	<button class="btn btn-info waves-effect btn-sm" type="button" id="query-param-add">{!! \Config::get('settings.icon_add') !!} <span>Add Option</span></button>
		    </div>
    	</div>
    	<div class="row">
    		<div class="col-lg-8 col-md-8 col-xs-12 col-sm-12 m-b-10">
    			<div class="form-group m-b-0">
		            <div class="form-line">
    					<textarea id="query-params" name="query_params" class="form-control">{!! $data->query_params ? json_encode($data->query_params) : '' !!}</textarea>
    				</div>
    			</div>
    		</div>
    	</div>
	</div>
</div>