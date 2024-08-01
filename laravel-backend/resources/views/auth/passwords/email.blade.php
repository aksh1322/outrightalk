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
        {{ Form::open(array('route' => 'password.email', 'method' => 'post', 'id' => 'sign_in', 'class' => 'form-horizontal')) }}
            <div class="msg">
                Enter your email address that you used to register. We'll send you an email with your username and a
                link to reset your password.
            </div>
            @include('admin.components.messages')
            <div class="form-group">
                <label for="email">Email</label>
                <input type="text" class="form-control" name="email" value="{{ old('email') }}" id="email" placeholder="Enter Registered Email" aria-required="true"{{ $errors->has('email') ? ' aria-invalid="true"' : '' }}>
                @if ($errors->has('email'))
                    <label class="error" for="email">
                        <strong>{{ $errors->first('email') }}</strong>
                    </label>
                @endif
            </div>

            <div class="mt-3">
                <button class="btn btn-primary btn-block waves-effect waves-light" type="submit">RESET MY PASSWORD</button>
            </div>
            <div class="mt-4 text-center">
                <a href="{{ url('admin/login') }}" class="text-muted"><i class="mdi mdi-lock mr-1"></i> Sign In!</a>
            </div>

        {{ Form::close() }}
    </div>
</div>
@endsection