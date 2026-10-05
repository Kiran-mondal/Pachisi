require 'sinatra'
require 'json'
require 'rack/cors'

# ফ্রন্টএন্ড থেকে API কল অ্যালাউ করার জন্য CORS কনফিগারেশন
use Rack::Cors do
  allow do
    origins '*'
    resource '*', headers: :any, methods: [:get, :post, :options]
  end
end

# Render-এর জন্য পোর্ট সেটআপ
set :port, ENV['PORT'] || 10000
set :bind, '0.0.0.0'

# ছক্কা রোল করার API
get '/api/roll' do
  content_type :json
  
  valid_faces = [1, 3, 4, 6]
  dice1 = valid_faces.sample
  dice2 = valid_faces.sample
  total_move = dice1 + dice2
  
  {
    player: params['player'] || 'unknown',
    dice: [dice1, dice2],
    totalMove: total_move,
    extraTurn: dice1 == dice2
  }.to_json
end

get '/' do
  "Pachisi Ruby Backend is Live!"
end
