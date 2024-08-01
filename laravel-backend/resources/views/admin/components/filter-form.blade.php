@if(isset($filters) && !empty($filters))
@php ($floatOff = ['select', 'multiselect', 'file', 'radio', 'checkbox', 'editor', 'date', 'custom', 'switch'])
@php ($dateTimePicker = 0)
	<form method="get">
            <input type="hidden" name="filter" value="1">
		<div class="card p-t-15">
			<div class="card-body">
				<div class="row">
					@foreach($filters['fields'] as $key => $value)
						@php ($attributes = (isset($value['attributes']) ? $value['attributes'] : []))
						@php ($attributes['id'] = (isset($attributes['id']) ? $attributes['id'] : $key))
						@php ($attributes['class'] = (isset($attributes['class']) ? $attributes['class'] : 'form-control'))
						@php ($inputValue = ((isset($value['value']) && $value['value']) ? $value['value'] : \Request::input($key)))
						@php ($dateTimePicker = (!$dateTimePicker && in_array($value['type'], ['date', 'time', 'datetime'])) ? 1 : $dateTimePicker)
						@if(!in_array($value['type'], ['html', 'include', 'hidden']))
						<div class="col-lg-3 col-md-3 col-sm-3 col-xs-12">
				          	<div class="form-group">
								<label for="{{ $attributes['id'] }}" class="form-label">{{ $value['label'] }}</label>
				              	<div class="{{ !in_array($value['type'], $floatOff) ? 'form-line' : '' }}">
				                  	@if($value['type'] == 'text')
					                    {!! Form::text($key, $inputValue, $attributes) !!}
					                @elseif($value['type'] == 'email')
					                    {!! Form::email($key, $inputValue, $attributes) !!}
					                @elseif($value['type'] == 'number')
					                    {!! Form::number($key, $inputValue, $attributes) !!}
					                @elseif($value['type'] == 'date')
					                    @php($attributes['class'] .= ' datepicker')
					                    {!! Form::text($key, $inputValue, $attributes) !!}
					                @elseif($value['type'] == 'time')
					                    @php($attributes['class'] .= ' timepicker')
					                    {!! Form::text($key, $inputValue, $attributes) !!}
					                @elseif($value['type'] == 'datetime')
					                    @php($attributes['class'] .= ' datetimepicker')
					                    {!! Form::text($key, $inputValue, $attributes) !!}
					                @elseif($value['type'] == 'password')
					                    {!! Form::password($key, $attributes) !!}
									@elseif($value['type'] == 'select')
										@php($attributes['data-live-search'] = "true")
	               	 					@php($attributes['data-size'] = 5)
					                    @if(is_array($value['options']) && !empty($value['options']))
					                        @php($value['options'] = ['' => 'Select Option'] + $value['options'])
					                    @endif
					                    {!! Form::select($key, $value['options'], $inputValue, $attributes) !!}
					                @elseif($value['type'] == 'multiselect')
					                    @php ($attributes['multiple'] = 'true')
					                    {!! Form::select($key, $value['options'], $inputValue, $attributes) !!}
					                @elseif($value['type'] == 'radio')
					                    <div class="clearfix"></div>
					                    <div class="row">
					                    @foreach($value['options'] as $k => $option)
					                        <div class="{{ isset($value['attributes']['width']) ? $value['attributes']['width'] : 'col-lg-6 col-md-6 col-sm-12 col-xs-12' }}">
					                          <input name="{{ $key }}" type="radio"  value="{{ $k }}" id="{{ $key . '-' . $k }}" {{ $inputValue == $k ? 'checked' : '' }} class="{{ $key }}" />
					                          <label for="{{ $key . '-' . $k }}">{{ $option }}</label>
					                        </div>
					                    @endforeach
					                    </div>
					                @elseif($value['type'] == 'checkbox')
					                    <div class="clearfix"></div>
					                    <div class="row">
					                        @foreach($value['options'] as $k => $option)
					                        <div class="{{ isset($value['attributes']['width']) ? $value['attributes']['width'] : 'col-lg-6 col-md-6 col-sm-12 col-xs-12' }}">
					                            <input type="checkbox" name="{{ $key }}[]" value="{{ $k }}" id="{{ $key . '-' . $k }}" {{ (is_array($inputValue) && in_array($k, $inputValue)) ? 'checked' : '' }} class="{{ $key }}" />
					                            <label for="{{ $key . '-' . $k }}">{{ $option }}</label>
					                        </div>
					                        @endforeach
					                    </div>
					                @elseif($value['type'] == 'switch')
					                    @foreach($value['options'] as $k => $option)
					                    <div class="{{ isset($value['attributes']['width']) ? $value['attributes']['width'] : 'col-lg-6 col-md-6 col-sm-12 col-xs-12' }}">
					                        <div class="switch">
					                            <label>{{ $option }} <input type="checkbox" name="{{ $key }}" value="{{ $k }}" id="{{ $key . '-' . $k }}" {{ $inputValue == $k ? 'checked' : '' }} class="{{ $key }}" ><span class="lever"></span></label>
					                        </div>
					                    </div>
					                    @endforeach
					                @elseif($value['type'] == 'custom')
					                    {!! $inputValue !!}
					                @endif
				              	</div>
				          	</div>
				        </div>
				        @elseif($value['type'] == 'hidden')
		                	{!! Form::hidden($key, $inputValue) !!}
				        @endif
					@endforeach
				</div>
			</div>
			<div class="card-footer">
				<button type="submit" class="btn btn-primary btn-lg waves-effect">{!! \Config::get('settings.icon_search') !!} <span>Filter</span></button>
				@if(isset($filters['reset']) && $filters['reset'])
				<a href="{{ $filters['reset'] }}" class="btn btn-default btn-lg waves-effect">{!! \Config::get('settings.icon_back') !!} <span>Reset</span></a>
				@endif
			</div>
		</div>
	</form>
	@if($dateTimePicker)
	    @include('admin.components.date-time-picker')
	@endif
@endif