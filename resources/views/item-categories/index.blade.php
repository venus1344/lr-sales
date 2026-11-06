@extends('layouts.app')

@section('title', 'Item categories — ' . config('app.name'))
@section('heading', 'Item categories')

@section('content')
    <livewire:item-categories />
@endsection
