<!-- <div class="col-md-12">
    <strong>Status:</strong> {{$data->statusList[$data->status]}}
</div> -->
<div class="col-md-12">
    <strong>Reject Reason:</strong> {{isset($data->rejectReasons[sizeof($data->rejectReasons) - 1]) ? $data->rejectReasons[sizeof($data->rejectReasons) - 1]->reason : ''}}
</div>