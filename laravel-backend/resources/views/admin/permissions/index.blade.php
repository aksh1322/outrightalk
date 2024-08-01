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
        <th>Permission types {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'permissions__p_type', $orderBy) !!}</th>
        <th>Module {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'permissions__class', $orderBy) !!}</th>
        <th>Function {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'permissions__method', $orderBy) !!}</th>
        @if($permission['edit'] || $permission['destroy'])
        <th width="15%" style="text-align: right;">Action</th>
        @endif
      </tr>
    </thead>
    <tbody>
          @foreach ($data as $value)
          <tr>
              <td>{{ $value->p_type }}</td>
              <td>{{ $value->class }}</td>
              <td>{{ $value->method }}</td>
              @if($permission['edit'] || $permission['destroy'])
              <td class="text-right">
                @if($permission['edit'])
                <a href="{{ route($routePrefix . '.edit', $value->id, $srch_params) }}" class="btn btn-outline-light waves-effect" data-toggle="tooltip" title="" data-original-title="Edit">{!! \Config::get('settings.icon_edit') !!}</a>
                @endif
                @if($permission['destroy'])
               <a class="btn btn-outline-danger waves-effect" data-toggle="tooltip" title="" data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?" data-confirm-yes="event.preventDefault();
                  document.getElementById('delete-form-{{$value->id}}').submit();" data-original-title="Delete">{!! \Config::get('settings.icon_delete') !!}</a>
                {!! Form::open([
                  'method' => 'DELETE',
                  'route' => [
                    $routePrefix . '.destroy',
                    $value->id
                    ],
                  'id' => 'delete-form-' . $value->id
                ]) !!}
                {!! Form::close() !!}
                @endif
              </td>
              @endif
          </tr>
          @endforeach
    </tbody>
  </table>
</div>
@include('admin.components.pagination')
@endsection