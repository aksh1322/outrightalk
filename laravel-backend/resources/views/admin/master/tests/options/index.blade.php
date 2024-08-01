@php ($headerOption = [
  'title' => $module,
  'header_buttons' => [
    ($permission['create'] ? '<a class="btn btn-primary waves-effect" href="'. route($routePrefix . '.create', $routeParams) .'" data-toggle="tooltip" data-original-title="Add New Record">'. \Config::get('settings.icon_add') .' <span>Add New</span></a>' : '')
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
       <th>Title {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'title', $orderBy, $routeParams) !!}</th>
       <th>Test Title {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'mt__title', $orderBy, $routeParams) !!}</th>
       <th>Display Order {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'display_order', $orderBy, $routeParams) !!}</th>
       <th>Type </th>
       <th>Status {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'status', $orderBy, $routeParams) !!}</th>
       @if($permission['edit'] || $permission['destroy'])
       <th width="15%" style="text-align: right;">Action</th>
       @endif
      </tr>
    </thead>
      <tbody>
      @if(count($data) != 0)
        @foreach ($data as $key => $val)
        @php($routeParams = [
              'test' => $val->master_test_id,
              'option' => $val->id
            ])
        <tr>
          <td>{{ $val->title }}</td>
          <td>{{ $val->master_title }}</td>
          <td>{{ $val->display_order }}</td>
          <td>{{ $val->type }}</td>
          <td><span class="badge badge-pill badge-soft-{{ $val->statusColorCodes[$val->status] }} font-size-12">{!! $val->statusList[$val->status] !!}</span></td>

          <!-- <td>{!! $val->status ? '<span class="label label-success">Enabled</span>' : '<span class="label label-danger">Disabled</span>' !!}</td> -->
          @if($permission['edit'] || $permission['destroy'])
          <td class="text-right">
            @if($permission['edit'])
            <a href="{{ route($routePrefix . '.edit', $routeParams) }}" class="btn btn-outline-light waves-effect" data-toggle="tooltip" title="" data-original-title="Edit">{!! \Config::get('settings.icon_edit') !!}</a>
            @endif
            @if($permission['destroy'])
           <a class="btn btn-outline-danger waves-effect" data-toggle="tooltip" title="" data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?" data-confirm-yes="event.preventDefault();
              document.getElementById('delete-form-{{$val->id}}').submit();" data-original-title="Delete">{!! \Config::get('settings.icon_delete') !!}</a>
            {!! Form::open([
              'method' => 'DELETE',
              'route' => [
                $routePrefix . '.destroy',
                $routeParams
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

