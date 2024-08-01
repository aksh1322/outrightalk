@php ($headerOption = [
'title' => $module,
'header_buttons' => [],
'filters' => isset($filters) ? $filters : [],
'data' => isset($data) ? $data : []
])
@extends('admin.layouts.layout', $headerOption)

@section('content')
<div class="table-responsive">
  <table class="table table-condensed">
    <thead>
      <tr>
        <th colspan="2">Name {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'first_name', $orderBy) !!}</th>
        <th>Contact {!! \App\Helpers\Helper::sort($routePrefix . '.index', 'email', $orderBy) !!}</th>
        <th>Status</th>
        <th>Created At</th>
        <th width="15%" style="text-align: right;">Action</th>
      </tr>
    </thead>
    <tbody>
      @if(count($data) != 0)
      @foreach ($data as $key => $val)
      <tr>
        <td width="10%"><img src="{{ $val->avatar['thumb'] }}" class="img-thumbnail" style="max-height: 70px;"></td>
        <td><a href="{{ route($routePrefix . '.show', $val->id) }}" data-toggle="modal" data-target="#myModal" data-remote="false" data-layout="true">{{ $val->full_name }}</a></td>
        <td>Email: {{ $val->email }}</td>
        <td><span class="badge badge-pill badge-soft-{{ $val->statusColorCodes[$val->status] }} font-size-12">{!! $val->statusList[$val->status] !!}</span></td>
        <td>{{ \App\Helpers\Helper::showDate($val->created_at) }}</td>
        <td class="text-right">
          @if($permission['edit'])
          <a href="{{ route($routePrefix . '.edit', $val->id) }}" class="btn btn-outline-light waves-effect" data-toggle="tooltip" title="" data-original-title="Edit">{!! \Config::get('settings.icon_edit') !!}</a>
          @endif
          @if($permission['destroy'])
          @if($val->id != auth()->user()->id)
          <a class="btn btn-outline-danger waves-effect" data-toggle="tooltip" title="" data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?" data-confirm-yes="event.preventDefault();
                document.getElementById('delete-form-{{$val->id}}').submit();" data-original-title="Delete">{!! \Config::get('settings.icon_delete') !!}</a>
          {!! Form::open([
          'method' => 'DELETE',
          'route' => [
          $routePrefix . '.destroy',
          $val->id
          ],
          'style'=>'display:inline',
          'id' => 'delete-form-' . $val->id
          ]) !!}
          {!! Form::close() !!}
          @endif
          @endif
          @if($val->id != auth()->user()->id)
          @if($val->status == 2)
          <a data-confirm="Are You Sure?|Please confirm to proceed." data-confirm-yes="event.preventDefault();
                document.getElementById('accept-form-{{$val->id}}').submit();" class="btn btn-outline-light waves-effect" data-toggle="tooltip" title="" data-original-title="Accept"><i class="mdi mdi-check-circle"></i></a>
          {!! Form::open([
          'method' => 'POST',
          'route' => [
          $routePrefix . '.approve'
          ],
          'style'=>'display:inline',
          'id' => 'accept-form-' . $val->id
          ]) !!}
          {{ Form::hidden('user_id', $val->id) }}
          {{ Form::hidden('status', 1) }}
          {!! Form::close() !!}
          <a data-confirm-reject="Are You Sure?|This action can not be undone. Do you want to continue?" data-confirm-yes="event.preventDefault();
                document.getElementById('reject-form-{{$val->id}}').submit();" class="btn btn-outline-danger waves-effect" data-toggle="tooltip" title="" data-original-title="Reject"><i class="mdi mdi-cancel"></i></a>
          {!! Form::open([
          'method' => 'POST',
          'route' => [
          $routePrefix . '.approve'
          ],
          'style'=>'display:inline',
          'id' => 'reject-form-' . $val->id
          ]) !!}
          {{ Form::hidden('user_id', $val->id) }}
          {{ Form::hidden('status', 3) }}
          {{ Form::hidden('reject_reason', '', array('id' => 'reject_reason')) }}
          {!! Form::close() !!}
          @endif
          @if($val->status == 1)
          <a data-confirm="Are You Sure?|Please confirm to proceed." data-confirm-yes="event.preventDefault();
                document.getElementById('block-form-{{$val->id}}').submit();" class="btn btn-outline-light waves-effect" data-toggle="tooltip" title="" data-original-title="Block"><i class="mdi mdi-lock"></i></a>
          {!! Form::open([
          'method' => 'POST',
          'route' => [
          $routePrefix . '.approve'
          ],
          'style'=>'display:inline',
          'id' => 'block-form-' . $val->id
          ]) !!}
          {{ Form::hidden('user_id', $val->id) }}
          {{ Form::hidden('status', 4) }}
          {!! Form::close() !!}
          @endif
          @if($val->status == 4)
          <a data-confirm="Are You Sure?|Please confirm to proceed." data-confirm-yes="event.preventDefault();
                document.getElementById('block-form-{{$val->id}}').submit();" class="btn btn-outline-light waves-effect" data-toggle="tooltip" title="" data-original-title="Unblock"><i class="mdi mdi-lock-open"></i></a>
          {!! Form::open([
          'method' => 'POST',
          'route' => [
          $routePrefix . '.approve'
          ],
          'style'=>'display:inline',
          'id' => 'block-form-' . $val->id
          ]) !!}
          {{ Form::hidden('user_id', $val->id) }}
          {{ Form::hidden('status', 1) }}
          {!! Form::close() !!}
          @endif
          @endif
          @if($val->status == 3)
          <a class="btn btn-outline-light waves-effect" href="{{ route($routePrefix . '.show', [$val->id, 'reject' => true]) }}" data-toggle="modal" data-target="#myModal" data-remote="false" data-layout="true">
            <i class="fas fa-info-circle"></i>
          </a>
          @endif
        </td>

      </tr>
      @endforeach
      @else
      <tr>
        <td colspan="25">
          <div class="alert alert-danger">No Data</div>
        </td>
      </tr>
      @endif
    </tbody>
  </table>
</div>

@include('admin.components.pagination')

@endsection