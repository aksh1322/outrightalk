<div class="alert alert-danger" style="{{($errors->has('error')) ? 'display:block' : 'display:none' }}">
    <button class="close" data-close="alert"></button>
    <span>{{ ($errors->has('error')) ? $errors->first('error') : 'Oh Snap! Error occured.' }} </span>
</div>
<div class="alert alert-success" style="{{($errors->has('success')) ? 'display:block' : 'display:none' }}">
    <button class="close" data-close="alert"></button>
    <span>{{ ($errors->has('success')) ? $errors->first('success') : 'Success' }} </span>
</div>
@if ($message = Session::get('success'))
<div class="row">
  <div class="col-lg-12">
    <div class="alert alert-success alert-dismissible"  role="alert">
      <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
      <p>{{ $message }}</p>
    </div>
  </div> 
</div>  
@endif
@if ($message = Session::get('error'))
  <div class="row">
    <div class="col-lg-12">
      <div class="alert alert-danger alert-dismissible"  role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <p>{{ $message }}</p>
      </div>
    </div> 
  </div>    
@endif
@if (session('status'))
<div class="alert alert-success" role="alert">
    {{ session('status') }}
</div>
@endif