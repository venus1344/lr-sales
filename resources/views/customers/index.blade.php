@extends('layouts.app')

@section('title', 'Customers — ' . config('app.name'))
@section('heading', 'Customers')

@section('content')
    <livewire:customers />
@endsection
