@php($controller = '')
@foreach($list as $key => $val)
	@if($controller != $val->class)
		@php($controller = $val->class)
		@php($controllerName = str_replace("Controller", "", $controller))
		<div class="clearfix"></div>
		<div class="row">
			<div class="col-lg-3 col-md-3 col-sm-6 col-xs-12"><h4>{{ preg_replace('/([a-z])([A-Z])/s','$1 $2', $controllerName) }}</h4></div>
		</div>
	@endif
	<div class="col-lg-3 col-md-3 col-sm-6 col-xs-12 padding-0">
		<div class="square-switch">
			<input type="checkbox"  name="pid[]" value="{{ $val->id }}" id="{{ $controller . '-' . $val->id }}"  {{ in_array($val->id, $permission) ? 'checked' : '' }} switch="none"/>
            <label for="{{ $controller . '-' . $val->id }}" data-on-label="" data-off-label=""></label> {{ ucwords($val->p_type) }}
        </div>
	</div>
@endforeach