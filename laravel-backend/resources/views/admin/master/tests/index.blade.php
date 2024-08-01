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
       <th>Title {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'title', $orderBy) !!}</th>
       <th>Type {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'type', $orderBy) !!}</th>
       <th>Display Order {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'display_order', $orderBy) !!}</th>
       <th>Required </th>
       <th>Status {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'status', $orderBy) !!}</th>
       @if($permission['edit'] || $permission['destroy'] || $permisssionOption['index'])
       <th width="15%" style="text-align: right;">Action</th>
       @endif
      </tr>
    </thead>
      <tbody>
      @if(count($data) != 0)
        @foreach ($data as $key => $val)
        <tr>
          <td>{{ $val->title }}</td>
          <td>{{ $val->type }}</td>
          <td>{{ $val->display_order }}</td>
          <td>{!! $val->requiredList[$val->required] !!}</td>
          <td><span class="badge badge-pill badge-soft-{{ $val->statusColorCodes[$val->status] }} font-size-12">{!! $val->statusList[$val->status] !!}</span></td>

          <!-- <td>{!! $val->status ? '<span class="label label-success">Enabled</span>' : '<span class="label label-danger">Disabled</span>' !!}</td> -->
          @if($permission['edit'] || $permission['destroy'] || $permisssionOption['index'])
          <td class="text-right">
            @if($permisssionOption['index'])
            <a href="{{ route($routePrefix . '.options.index', $val->id) }}" class="btn btn-outline-light waves-effect"><i class="bx bx-list-ul"></i></a>
            @endif
            @if($permission['edit'])
            <a href="{{ route($routePrefix . '.edit',$val->id) }}" class="btn btn-outline-light waves-effect" data-toggle="tooltip" data-original-title="Edit">{!! \Config::get('settings.icon_edit') !!}</a>
            @endif
            @if($permission['destroy'])
           <a class="btn btn-outline-danger waves-effect" data-toggle="tooltip" data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?" data-confirm-yes="event.preventDefault();
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

