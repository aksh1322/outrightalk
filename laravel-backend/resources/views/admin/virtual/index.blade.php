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
                <th>Plan No</th>
                <th>Icon</th>
                <th>Credits</th>
                <th>Price</th>
                <th>Paid Credits</th>
                <th>Free Credits</th>
                <th>Expire in Months</th>
                @if($permission['edit'] || $permission['destroy'] || $permisssionState['index'])
                    <th width="20%" style="text-align:center;">Action</th>
                @endif
            </tr>
        </thead>
        <tbody>
            @if(count($data))
            @foreach ($data as $key => $val)
            <tr>
                <td>{{$key + 1}}</td>
                <td width="10%">
                    @if($val->icon['thumb'])
                        <img src="{{ $val->icon['thumb'] }}" class="rounded-circle avatar-md" style="max-height: 70px;">
                    @endif
                </td>
                <td>{{ $val->credit_type }}</td>
                <td>{{ $val->price }}</td>
                <td>{{ $val->paid_credit }}</td>
                <td>{{ $val->free_credit }}</td>
                <td>{{ $val->expire_in_months }}</td>

                @if($permission['edit'] || $permission['destroy'] || $permisssionState['index'])
                <td class="text-center">
                    @if($permission['edit'])
                        <a href="{{ route($routePrefix . '.edit',$val->id) }}" class="btn btn-outline-success waves-effect" title="edit" data-original-title="Edit">{!! \Config::get('settings.icon_edit') !!}</a>
                    @endif
                    {{-- @if($permission['destroy'])
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
                    @endif --}}
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

