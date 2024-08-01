@php ($headerOption = [
  'title' => $module,
  'header_button' => ''
])
@extends('admin.layouts.layout', $headerOption)


@section('content')
    @include($includePage)
    <div class="clearfix"></div>
@endsection
