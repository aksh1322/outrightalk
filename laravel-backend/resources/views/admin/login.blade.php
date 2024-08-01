@extends('admin.layouts.layout-login')
@section('content')
<div class="bg-soft-primary">
    <div class="row">
        <div class="col-7">
            <div class="text-primary p-4">
                <h5 class="text-primary">Welcome Back !</h5>
                <p>Sign in to continue to {{ \Config::get('settings.company_name') }}.</p>
            </div>
        </div>
        <div class="col-5 align-self-end">
            <img src="assets/images/profile-img.png" alt="" class="img-fluid">
        </div>
    </div>
</div>
<div class="card-body pt-0">
    <div>
        <a href="index.html">
            <div class="avatar-md profile-user-wid mb-4">
                <span class="avatar-title rounded-circle bg-light">
                    <img src="assets/images/logo.svg" alt="" class="rounded-circle" height="34">
                </span>
            </div>
        </a>
    </div>
    <div class="p-2">
        {{ Form::open(array('url' => 'admin/login', 'method' => 'post', 'id' => 'sign_in', 'class' => 'form-horizontal')) }}
            @include('admin.components.messages')
            <div class="form-group">
                <label for="email">Email</label>
                <input type="text" class="form-control" name="email" value="{{ old('email') }}" id="email" placeholder="Email" aria-required="true"{{ $errors->has('email') ? ' aria-invalid="true"' : '' }}>
                @if ($errors->has('email'))
                    <label class="error" for="email">
                        <strong>{{ $errors->first('email') }}</strong>
                    </label>
                @endif
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" class="form-control" name="password" id="password" placeholder="Password" aria-required="true"{{ $errors->has('password') ? ' aria-invalid="true"' : '' }}>
                @if ($errors->has('password'))
                    <label class="error" for="password">
                        <strong>{{ $errors->first('password') }}</strong>
                    </label>
                @endif
            </div>

            <div class="mt-3">
                <button class="btn btn-primary btn-block waves-effect waves-light" type="submit">Log In</button>
            </div>
            <div class="mt-4 text-center">
                <a href="{{url('/admin/password/reset')}}" class="text-muted"><i class="mdi mdi-lock mr-1"></i> Forgot your password?</a>
            </div>
        {{ Form::close() }}
    </div>
</div>
@endsection