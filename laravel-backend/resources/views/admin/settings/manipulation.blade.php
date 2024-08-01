@php ($headerOption = [
  'title' => $module
])
@extends('admin.layouts.layout', $headerOption)
@php($hasPermission = false)

@section('content')
 <div class="body">
    @if(isset($data['tabs']) && !empty($data['tabs']))
    <ul class="nav nav-tabs nav-tabs-custom nav-justified" role="tablist">
        @foreach($data['tabs'] as $tab)
        <li role="presentation" class="nav-item"><a href="{{ $tab['url'] }}" class="nav-link {{ $tab['active'] ? 'active' : '' }}">{{ $tab['name'] }}</a></li>
        @endforeach
    </ul>
    @endif
    <div class="tab-content">
    	<div class="row">
    		@if($permission['settingsImport'] && $importForm)
    		@php($hasPermission = true)
		    	<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
		    		<div class="card card-default card-post">
		    			<div class="card-body">
							<h4 class="card-title">Import Module</h4> 
		    				<p class="card-title-desc">Import setting file into your application.</p>
		    				<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 m-t-10">
		    					@php($form = $importForm)
		    					@include('admin.components.admin-form-wrapper')
		    				</div>
		    			</div>
		    		</div>
		    	</div>
	    	@endif
	    	@if($permission['settingsExport'] && $exportForm)
	    	@php($hasPermission = true)
		    	<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
		    		<div class="card card-default card-post">
		    			<div class="card-body">
							<h4 class="card-title">Export Module</h4> 
		    				<p class="card-title-desc">Export your setting file from your application.</p>
		    				<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 m-t-10">
		    					@php($form = $exportForm)
		    					@include('admin.components.admin-form-wrapper')
		    				</div>
		    			</div>
		    		</div>
		    	</div>
	    	@endif
	    	@if($permission['uiIcons'] || $permission['uiElements'] || $permission['create'])
	    	@php($hasPermission = true)
		    	<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
		    		<div class="card card-default card-post">
		    			<div class="card-body">
							<h4 class="card-title">Other Modules</h4> 
		    				<p class="card-title-desc">List of helper modules to build your site better.</p>
							<div class="row">
								@if($permission['uiIcons'])
									<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12 m-t-15 ">
										<a href="{{ route('ui.icons') }}" class="btn btn-info waves-effect btn-lg btn-block" data-toggle="modal" data-target="#myModal" data-remote="false" data-layout="true"><i class="bx bx-info-circle"></i> <span>Icons</span></a>
									</div>
								@endif
								@if($permission['uiElements'])
									<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12 m-t-15 ">
										<a href="{{ route('ui.icons') }}" class="btn btn-info waves-effect btn-lg btn-block" data-toggle="modal" data-target="#myModal" data-remote="false" data-layout="true"><i class="bx bx-info-circle"></i> <span>UI Elements</span></a>
									</div>
								@endif
								@if($permission['create'])
									<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12 m-t-15 ">
										<a href="{{ route('settings.create') }}" class="btn btn-info waves-effect btn-lg btn-block"><i class="bx bx-cog"></i> <span>Add Setting</span></a>
									</div>
								@endif
							</div>
		    				
		    			</div>
		    		</div>
		    	</div>
    		@endif

    		@if(!$hasPermission)
    		<div class="col-lg-12 col-sm-12">
    			<div class="alert alert-info">
    				<h3 class="align-center">
    					<i class="mdi mdi-information-outline font-50"></i>
    				</h3>
    				<p class="align-center font-24">You don't have any permission to access this page.</p>
    			</div>
    		</div>
    		@endif
    	</div>
    </div>
</div>
  
@endsection
