@php ($headerOption = [
'title' => $module,
'header_buttons' => [
// ($permission['create'] ? '<a class="btn btn-primary waves-effect" href="'. route($routePrefix . '.create') .'" data-toggle="tooltip" data-original-title="Add New Record">'. \Config::get('settings.icon_add') .' <span>Add New</span></a>' : '')
],
'filters' => isset($filters) ? $filters : [],
'data'    => isset($data) ? $data : []
])
@extends('admin.layouts.layout', $headerOption)

@section('content')
<div class="row">
    <div class="col-lg-12 col-sm-12">
        {{-- <form method="get" name="filter-by-pid">
            <div class="card">
                <div class="card-body"> 
                    <div class="row">
                        <div class="col-lg-3 col-md-3 col-sm-3 col-xs-12">
                            <div class="form-group">
                                <label for="select-type" class="form-label">Select Category</label>
                                <div class="">
                                    <select id="select-parent_id" class="form-control" data-live-search="true" data-size="5" name="pid">
                                        <option value="" selected="selected">Select Option</option>
                                        @if(count($pcategory))
                                        @foreach($pcategory as $pcat)
                                            <option value="{{ $pcat->id }}" @if(isset($srch_params['pid']) && $srch_params['pid'] == $pcat->id) selected @endif>{{ $pcat->title }}</option>
                                        @endforeach
                                        @endif
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form> --}}
    </div>
</div>
<div class="table-responsive">
    <table class="table table-condensed">
        <thead>
            <tr>
                <th>Subscription ( Name -- Type )</th> 
                <th>Type</th>
                <th>Gift</th>
                <th>Show Price</th>
                <th>Free Credits</th>
                <th>Virtual Credits</th>
                <th>Credits Points</th>

                @if($permission['edit'] || $permission['destroy'] || $permisssionState['index'])
                    <th width="20%" style="text-align:center;">Action</th>
                @endif
            </tr>
        </thead>
        <tbody>
            @if(count($data))
            @foreach ($data as $key => $val)
            <tr>
                <td>{{ $val->plan->title.' -- '.$val->plan->type }}</td>
                <td>{{ $val->type }}</td>
                <td><span class="badge {{ $val->is_gift ? 'badge-success' :  'badge-danger'}}">{{ $val->is_gift ? 'Yes' :  'No'}}</span></td>
                <td>{{ $val->show_price }}</td>
                <td>{{ $val->free_credits }}</td>
                <td>{{ $val->virtual_credits }}</td>
                <td>{{ $val->points }}</td>


                @if($permission['edit'] || $permission['destroy'] || $permisssionState['index'])
                <td class="text-center">
                    @if($permission['edit'])
                        <a href="{{ route($routePrefix . '.priceEdit',[request()->id,$val->id]) }}" class="btn btn-outline-success waves-effect" title="edit" data-original-title="Edit">{!! \Config::get('settings.icon_edit') !!}</a>
                    @endif
                    {{--@if($permission['destroy'])
                    <a class="btn btn-outline-danger waves-effect" title="delete" data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?" data-confirm-yes="event.preventDefault();
                       document.getElementById('delete-form-{{$val->id}}').submit();" data-original-title="Delete">{!! \Config::get('settings.icon_delete') !!}</a>
                        {!! Form::open([
                        'method' => 'DELETE',
                        'route' => [
                        $routePrefix . '.destroy',
                        $val->id
                        ],
                        'id' => 'delete-form-'.$val->id
                        ]) !!}
                        {!! Form::close() !!}
                    @endif--}}
                </td>
                @endif
            </tr>
            @endforeach
            @else
            <tr><td colspan="25"><div class="alert alert-danger">No Data</div></td></tr>
            @endif
        </tbody>
    </table>
</div>
@include('admin.components.pagination')
@endsection

