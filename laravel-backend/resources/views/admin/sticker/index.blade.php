@php ($headerOption = [
  'title' => $module,
  'header_buttons' => [
    ($permission['create'] ? '<a class="btn btn-primary waves-effect" href="'. route($routePrefix . '.create') .'" data-toggle="tooltip" data-original-title="Add New Record">'. \Config::get('settings.icon_add') .' <span>Add New</span></a>' : '')
  ],
  'filters' => isset($filters) ? $filters : [],
  'data'    => isset($data) ? $data : []
])
@extends('admin.layouts.layout', $headerOption)


@section('content')
<div class="table-responsive">
  <table class="table table-condensed">
    <thead>
      <tr>
       <th>Sticker Title {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'title', $orderBy) !!}</th>
       <th>Category Type</th>
       <th>Category {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'category_id', $orderBy) !!}</th>
       <th>Sticker Type</th>
       <th>Sticker Pack</th>
       <th>Credit Points </th>
       <th>Image</th>
       @if($permission['edit'] || $permission['destroy'] || $permisssionState['index'])
       <th width="15%" style="text-align: right;">Action</th>
       @endif
      </tr>
    </thead>
      <tbody>
      @if(count($data))
        @foreach ($data as $key => $val)
        <tr>
          <td>{{ $val->title }}</td>
          <td>{{ $val->type }}</td>
          <td>{{ $val->cat_title }}</td>
          <td>{{ $val->sticker_type_name }}</td>
          <td>{{ $val->sticker_pack_name }}</td>
          <td>{{ ($val->type == 'credit') ? $val->credit_points : '-' }}</td>
          <td width="10%"><img src="{{ $val->icon['thumb'] }}" class="rounded-circle avatar-md" style="max-height: 70px;"></td>
          @if($permission['edit'] || $permission['destroy'] || $permisssionState['index'])
          <td class="text-right">
            @if($permission['edit'])
            <a href="{{ route($routePrefix . '.edit',$val->id) }}" class="btn btn-outline-light waves-effect" data-toggle="tooltip" title="" data-original-title="Edit">{!! \Config::get('settings.icon_edit') !!}</a>
            @endif
            @if($permission['destroy'])
           <a class="btn btn-outline-danger waves-effect" data-toggle="tooltip" title="" data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?" data-confirm-yes="event.preventDefault();
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
            @endif
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

