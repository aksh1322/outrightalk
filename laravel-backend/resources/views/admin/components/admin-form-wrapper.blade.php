@if(isset($form['tabs']) && !empty($form['tabs']))
    <ul class="nav nav-tabs nav-tabs-custom nav-justified" role="tablist">
        @foreach($form['tabs'] as $tab)
        <li role="presentation" class="nav-item"><a href="{{ $tab['url'] }}" class="nav-link {{ $tab['active'] ? 'active' : '' }}">{{ $tab['name'] }}</a></li>
        @endforeach
    </ul>
    @endif
    <div class="tab-content pt-3">
@php($requestParam = Request::all())
@if(isset($form['route_param']) && $form['route_param'])
    @php($requestParam = array_merge($requestParam, $form['route_param']))
@endif
@if($id)
    @php($requestParam[] = $id)
    {!! Form::model($data, [
        'method'    => 'PATCH',
        'route'     => [
            $form['route'],
            $requestParam
        ],
        'class'     => 'form-horizontal',
        'enctype'   => 'multipart/form-data'
        ]) !!}
@else
    {!! Form::open(array(
        'route'     => [
            $form['route'],
            $requestParam
        ],
        'method'    => 'POST',
        'enctype'   => 'multipart/form-data'
    )) !!}
@endif
    @if(!empty($form['fields']))
        @php ($multiSelectScript = 0)
        @php ($dateTimePicker = 0)
        @php ($fileCropper = 0)
        @php ($fileCropper = 0)
        @php ($oneElementEachRow = true)
        @php ($rowClass = 'form-group row mb-4')
        @foreach($form['fields'] as $key => $value)
            @if(isset($value['row_width']))
                @if($oneElementEachRow)
                    <div class="form-group row mb-4'">
                @endif
                @php ($rowClass =  $value['row_width'])
                @php ($oneElementEachRow = false)
            @else
                @if(!$oneElementEachRow)
                    </div>
                @endif
                @php ($rowClass = 'form-group row mb-4')
                @php ($oneElementEachRow = true)
            @endif
            @php ($extraWidth = (isset($value['extra']['field_width']) ? $value['extra']['field_width'] : 'col-lg-3 col-md-3 col-xs-12 col-sm-12'))
            @php ($dateTimePicker = (!$dateTimePicker && in_array($value['type'], ['date', 'time', 'datetime'])) ? 1 : $dateTimePicker)
            @php ($fileCropper = (!$fileCropper && $value['type'] == 'file' && isset($value['attributes']) && array_key_exists("cropper", $value['attributes']) && $value['attributes']['cropper']) ? 1 : $fileCropper)
            @php ($coverClass = '')
            @php ($inputValue = (isset($value['value']) ? $value['value'] : null))
            @if(!in_array($value['type'], ['html', 'include', 'hidden']))

                <div class="{{ $rowClass }}" id="row-{{ str_replace('[]', '', $key) }}">
                    @include('admin.components.admin-form-field')
                    @if(isset($value['extra']) && $value['extra'])
                    <div class="{{ $extraWidth }}">
                        @php($value = $value['extra'])
                        @php($coverClass = 'row')
                        @include('admin.components.admin-form-field')
                    </div>
                    @endif
                </div>
            @elseif($value['type'] == 'hidden')
                {!! Form::hidden($key, $inputValue) !!}
            @elseif($value['type'] == 'html')
                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12" id="row-{{ $key }}">{!! $value['value'] !!}</div>
                <div class="clearfix"></div>
            @elseif($value['type'] == 'include')
                @include($value['value'])
            @endif
        @endforeach

        @if(!$oneElementEachRow)
            </div>
        @endif

        @if($dateTimePicker)
            @include('admin.components.date-time-picker')
        @endif

        @if($fileCropper)
            @push('page_css')
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/croppie/2.6.4/croppie.min.css">
            @endpush
            @push('page_script')
            <div class="modal fade" id="cropper_modal" data-backdrop="static" data-keyboard="false">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">Crop uploaded image</h4>
                        </div>
                        <div class="modal-body">
                            <div class="croppie-modal-wrap" style="width: 100%; height: 100%;"></div>
                        </div>
                        <div class="modal-footer justify-content-between">
                            <!-- <button type="button" class="btn btn-default" data-dismiss="modal">Close</button> -->
                            <button class="btn btn-default rotate-left">Rotate left</button>
                            <button class="btn btn-default rotate-right">Rotate right</button>
                            <button type="button" class="btn btn-primary crop-btn">Crop</button>
                        </div>
                    </div>
                    <!-- /.modal-content -->
                </div>
                <!-- /.modal-dialog -->
            </div>
            <!-- /.modal -->
            <script src="https://cdnjs.cloudflare.com/ajax/libs/croppie/2.6.4/croppie.min.js"></script>
            <script>
                var cropper = [];
                var previousImage = [];
                var rawImage, fileId;
            </script>
            <script src="{{ asset('/administrator/admin-form-plugins/cropper.js')}}"></script>
            @endpush
        @endif
    @endif
    @if(isset($include_page))
        @include($include_page)
    @endif
    </div>
    <div class="clearfix"></div>
    @if(!isset($form['custom_buttons']))
        <div class="card-footer">
            <button type="submit" class="btn btn-primary btn-lg waves-effect">{!! (isset($form['submit_text']) ? $form['submit_text'] : \Config::get('settings.icon_save') . ' <span>Save Changes</span>') !!}</button>
                @if(isset($form['back_route']))
                <a href="{{ $form['back_route'] }}" class="btn btn-info btn-lg waves-effect">{!! \Config::get('settings.icon_back') !!} <span>Back</span></a>
                @endif

        </div>
    @else
        <div class="card-footer">
            @foreach($form['custom_buttons'] as $button)
                <button type="{{ isset($button['type']) ? $button['type'] : 'submit' }}" {!! isset($button['attributes']) ? \App\Helpers\Helper::getAttr($button['attributes']) : '' !!}>{!! $button['text'] !!}</button>
            @endforeach
        </div>
    @endif
{!! Form::close() !!}

<div class="clearfix"></div>
@if(isset($form['include_scripts']))
    @push('page_script')
        {!! $form['include_scripts'] !!}
    @endpush
@endif
