@extends('admin.layouts.layout-login')

@section('content')
<div class="bg-soft-primary">
    <div class="row">
        <div class="col-7">
            <div class="text-primary p-4">
                <h5 class="text-primary">Reset Password</h5>
                <p>Re-Password with {{ \Config::get('settings.company_name') }}.</p>
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
        {{ Form::open(array('route' => 'password.update', 'method' => 'post', 'id' => 'reset_password')) }}
        <input type="hidden" name="token" value="{{ $token }}">
        <div class="msg">Reset your account password</div>
        @include('admin.components.messages')
        <div class="form-group">
            <!-- <span class="input-group-addon">
                <i class="mdi mdi-email mr-1"></i>
            </span> -->
            <div class="form-line{{ $errors->has('email') ? ' error' : '' }}">
                <input placeholder="Enter Registered Email" id="email" type="email" class="form-control{{ $errors->has('email') ? ' is-invalid' : '' }}" name="email" value="{{ old('email') }}" required>
            </div>
            @if ($errors->has('email'))
            <label class="error" for="email">
                <strong>{{ $errors->first('email') }}</strong>
            </label>
            @endif
        </div>
        <div class="form-group">
            <!-- <span class="input-group-addon">
                <i class="mdi mdi-lock mr-1"></i>
            </span> -->
            <div class="form-line{{ $errors->has('password') ? ' error' : '' }}">
                <input placeholder="Password" id="password" type="password" class="form-control{{ $errors->has('password') ? ' is-invalid' : '' }}" name="password" required>
            </div>
            @if ($errors->has('password'))
            <label class="error" for="password">
                <strong>{{ $errors->first('password') }}</strong>
            </label>
            @endif
        </div>
        <div class="form-group">
            <!-- <span class="input-group-addon">
                <i class="mdi mdi-lock mr-1"></i>
            </span> -->
            <div class="form-line{{ $errors->has('password-confirm') ? ' error' : '' }}">
                <input placeholder="Confirm Password" id="password-confirm" type="password" class="form-control" name="password_confirmation" required>
            </div>
        </div>
        <button class="btn btn-primary btn-block waves-effect waves-light" type="submit">RESET PASSWORD</button>
        {{ Form::close() }}
    </div>
</div>
@endsection