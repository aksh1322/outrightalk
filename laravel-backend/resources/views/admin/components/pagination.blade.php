@if(isset($data) && $data)
@section('card-footer')
<div class="card-footer">
	<div class="row">
		<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12 m-b-15 font-bold">Total records: {{ $data->count() }}</div>
		{{ $data->appends(request()->input())->links() }}
		<div class="clearfix"></div> 
	</div>
</div>
@endsection
@endif