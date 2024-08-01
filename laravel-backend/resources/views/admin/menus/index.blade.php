@php ($headerOption = [
  'title' => $module,
  'header_buttons' => [
    ($permission['create'] ? '<a class="btn btn-primary waves-effect" href="'. route($routePrefix . '.create', $parent_id) .'" data-toggle="tooltip" data-original-title="Add New Record">'. \Config::get('settings.icon_add') .' <span>Add New</span></a>' : '')
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
        <th>Menu Name</th>
        <th>Url</th>
        <th>Status</th>
        @if($permission['create'] || $permission['edit'] || $permission['destroy'])
        <th width="25%" style="text-align: right;">Action</th>
        @endif
      </tr>
    </thead>
    <tbody>
          @foreach ($data as $value)
          <tr>
              <td>{{ $value->menu }}</td>
              <td>{{ $value->url }}</td>
              <td><span class="badge badge-pill badge-soft-{{ $value->statuses[$value->status]['badge'] }} font-size-12">{!! $value->statuses[$value->status]['name'] !!}</span></td>
              @if($permission['create'] || $permission['edit'] || $permission['destroy'])
              <td class="text-right">
                @if(!$value->parent_id)
                  @if($permission['create'])
                  <a href="{{ route($routePrefix . '.create', $value->id) }}" class="btn btn-outline-light waves-effect" data-toggle="tooltip" title="" data-original-title="Add New Record">{!! \Config::get('settings.icon_add') !!}</a>
                  @endif
                  <a href="{{ route($routePrefix . '.index', $value->id) }}" class="btn btn-outline-light waves-effect" data-toggle="tooltip" title="" data-original-title="View Sub Menus"><i class="fa fa-fw fa-bars"></i></a>
                @endif
                @if($permission['edit'])
                <a href="{{ route($routePrefix . '.edit', [$value->parent_id, $value->id]) }}" class="btn btn-outline-light waves-effect" data-toggle="tooltip" title="" data-original-title="Edit">{!! \Config::get('settings.icon_edit') !!}</a>
                @endif
                @if($permission['destroy'])
               <a class="btn btn-outline-danger waves-effect waves-light" data-toggle="tooltip" title="" data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?" data-confirm-yes="event.preventDefault();
                  document.getElementById('delete-form-{{$value->id}}').submit();" data-original-title="Delete">{!! \Config::get('settings.icon_delete') !!}</a>
                {!! Form::open([
                  'method' => 'DELETE',
                  'route' => [
                    $routePrefix . '.destroy', [
                      $value->parent_id,
                      $value->id
                    ]
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